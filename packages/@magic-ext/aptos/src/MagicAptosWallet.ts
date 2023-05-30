import type {
  AccountInfo,
  AdapterPlugin,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
} from '@aptos-labs/wallet-adapter-core';
import { Types } from 'aptos';
import type { Magic } from 'magic-sdk';
import { AptosExtension } from '.';
import { APTOS_NETWORKS, APTOS_NODE_URLS, APTOS_WALLET_NAME, ICON_BASE64 } from './constants';

export class MagicAptosWallet implements AdapterPlugin {
  readonly name = APTOS_WALLET_NAME;
  readonly url = 'https://magic.link/';
  readonly icon = ICON_BASE64;

  readonly providerName = 'magicWallet';

  provider: Magic<[AptosExtension]>;
  private accountInfo: AccountInfo | null;

  constructor(magic: Magic<[AptosExtension]>) {
    this.provider = magic;
    this.accountInfo = null;
  }

  async connect(): Promise<AccountInfo> {
    throw new Error('Please use connectWithMagicLink method instead');
  }

  async connectWithMagicLink({ email }: { email: string }): Promise<AccountInfo> {
    await this.provider.auth.loginWithMagicLink({ email });
    const accountInfo = await this.account();

    return accountInfo;
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
