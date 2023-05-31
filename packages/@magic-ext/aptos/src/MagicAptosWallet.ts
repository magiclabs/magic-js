import type {
  AccountInfo,
  AdapterPlugin,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
} from '@aptos-labs/wallet-adapter-core';
import { TxnBuilderTypes, Types } from 'aptos';
import type { Magic } from 'magic-sdk';
import { AptosExtension } from '.';
import { APTOS_NETWORKS, APTOS_NODE_URLS, APTOS_WALLET_NAME, ICON_BASE64 } from './constants';
import { MagicAptosWalletConfig } from './type';

export class MagicAptosWallet implements AdapterPlugin {
  readonly name = APTOS_WALLET_NAME;
  readonly url = 'https://magic.link/';
  readonly icon = ICON_BASE64;

  readonly providerName = 'magicWalletMA';

  provider: Magic<[AptosExtension]>;
  magicAptosWalletConfig: MagicAptosWalletConfig;

  private accountInfo: AccountInfo | null;

  constructor(magic: Magic<[AptosExtension]>, { loginWith = 'magicLink' }: MagicAptosWalletConfig) {
    this.provider = magic;
    this.accountInfo = null;
    this.magicAptosWalletConfig = {
      loginWith,
    };
  }

  async connect(): Promise<AccountInfo> {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'magic-aptos-wallet-iframe');
    iframe.setAttribute('name', 'Connect with Magic');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.src =
      'data:text/html,' +
      `<html>
        <head>
          <title>Aptos MagicLink</title>
        </head>
        <body>
          <h1>Aptos MagicLink</h1>
          <input type="email" id="emailInput">
          <button onclick="submitEmail()">Send</button>
          <button onclick="cancel()">Cancel</button>
        
          <script>
            function submitEmail() {
              console.log("Hey")
              const email = document.getElementById('emailInput').value;
              const message = { type: 'emailSubmitted', email };
        
              parent.postMessage(message, '*');
            }

            function cancel() {
              const message = { type: 'cancel' };
              parent.postMessage(message, '*');
            }
          </script>
        </body>
      </html>`;
    document.getElementsByTagName('body')[0].appendChild(iframe);

    return new Promise<AccountInfo>((resolve, reject) => {
      window.addEventListener('message', async (e): Promise<void> => {
        if (e?.data?.type === 'emailSubmitted') {
          const email = e?.data?.email;
          if (email) {
            document.getElementsByTagName('body')[0].removeChild(iframe);
            await this.provider.auth.loginWithMagicLink({ email });
            const accountInfo = await this.account();
            resolve(accountInfo);
          }
        }

        if (e?.data?.type === 'cancel') {
          document.getElementsByTagName('body')[0].removeChild(iframe);
          reject();
        }
      });
    });
  }

  async account(): Promise<AccountInfo> {
    try {
      if (!this.accountInfo) {
        const accountInfo = await this.provider.aptos.getAccountInfo();
        this.accountInfo = accountInfo;
      }

      return this.accountInfo;
    } catch (e) {
      console.warn(e);
      throw new Error('Please call connectWithMagicLink method first');
    }
  }

  async disconnect(): Promise<void> {
    this.accountInfo = null;
    await this.provider.user.logout();
  }

  async signTransaction(rawTransaction: TxnBuilderTypes.RawTransaction): Promise<Uint8Array> {
    const accountInfo = await this.account();
    return this.provider.aptos.signTransaction(accountInfo.address, rawTransaction);
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any,
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    const accountInfo = await this.account();
    return this.provider.aptos.signAndSubmitTransaction(accountInfo.address, transaction, options);
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    const accountInfo = await this.account();
    return this.provider.aptos.signMessage(accountInfo.address, message);
  }

  async network(): Promise<NetworkInfo> {
    const { nodeUrl } = this.provider.aptos.aptosConfig;

    switch (nodeUrl) {
      case APTOS_NODE_URLS.MAINNET:
        return APTOS_NETWORKS[APTOS_NODE_URLS.MAINNET];
      case APTOS_NODE_URLS.TESTNET:
        return APTOS_NETWORKS[APTOS_NODE_URLS.TESTNET];
      case APTOS_NODE_URLS.DEVNET:
        return APTOS_NETWORKS[APTOS_NODE_URLS.DEVNET];
      default:
        throw new Error('Invalid node url');
    }
  }

  async onNetworkChange(callback: any): Promise<void> {
    console.warn('onNetworkChange is not supported');
    return Promise.resolve();
  }

  async onAccountChange(callback: any): Promise<void> {
    console.warn('onAccountChange is not supported');
    return Promise.resolve();
  }
}
