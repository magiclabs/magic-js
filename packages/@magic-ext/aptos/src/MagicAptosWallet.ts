import {
  AccountInfo,
  AdapterPlugin,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
  WalletInfo,
  WalletReadyState,
} from '@aptos-labs/wallet-adapter-core';
import { TxnBuilderTypes, Types } from 'aptos';
import type { Extension, Magic } from 'magic-sdk';
import { AptosExtension } from '.';
import { APTOS_NETWORKS, APTOS_NODE_URLS, APTOS_WALLET_NAME, ICON_BASE64 } from './constants';
import { MagicAptosWalletConfig } from './type';

export class MagicAptosWallet implements AdapterPlugin {
  readonly name = APTOS_WALLET_NAME;
  readonly url = 'https://magic.link/';
  readonly icon = ICON_BASE64;

  readonly providerName = 'magicWalletMA';

  provider: Magic<[AptosExtension, Extension]> | undefined;
  magicAptosWalletConfig: MagicAptosWalletConfig;

  readyState?: WalletReadyState = WalletReadyState.Loadable;

  private accountInfo: AccountInfo | null;

  constructor(
    magic: Magic<[AptosExtension, Extension]> | undefined,
    { loginWith = 'magicLink' }: MagicAptosWalletConfig,
  ) {
    this.provider = magic;
    this.accountInfo = null;
    this.magicAptosWalletConfig = {
      loginWith,
    };
  }

  async connect(): Promise<AccountInfo> {
    if (!this.provider) {
      throw new Error('Provider is not defined');
    }

    const isLoggedIn = await this.provider.user.isLoggedIn();
    if (isLoggedIn) {
      const accountInfo = await this.account();
      return accountInfo;
    }

    const email = await this.provider.aptos.showEmailForm();
    await this.provider?.auth.loginWithMagicLink({ email });
    const accountInfo = await this.account();

    return accountInfo;
  }

  async account(): Promise<AccountInfo> {
    if (!this.provider) {
      throw new Error('Provider is not defined');
    }

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
    if (!this.provider) {
      throw new Error('Provider is not defined');
    }

    this.accountInfo = null;
    await this.provider.user.logout();
  }

  async signTransaction(transaction: Types.TransactionPayload): Promise<Uint8Array> {
    if (!this.provider) {
      throw new Error('Provider is not defined');
    }

    const accountInfo = await this.account();
    return this.provider.aptos.signTransaction(accountInfo.address, transaction);
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any,
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    if (!this.provider) {
      throw new Error('Provider is not defined');
    }

    const accountInfo = await this.account();
    return this.provider.aptos.signAndSubmitTransaction(accountInfo.address, transaction, options);
  }

  async signAndSubmitBCSTransaction(transaction: TxnBuilderTypes.TransactionPayload): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider is not defined');
    }

    const accountInfo = await this.account();
    return this.provider.aptos.signAndSubmitBCSTransaction(accountInfo.address, transaction);
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    if (!this.provider) {
      throw new Error('Provider is not defined');
    }

    const accountInfo = await this.account();
    return this.provider.aptos.signMessage(accountInfo.address, message);
  }

  async signMessageAndVerify(message: SignMessagePayload): Promise<boolean> {
    if (!this.provider) {
      throw new Error('Provider is not defined');
    }

    const accountInfo = await this.account();
    return this.provider.aptos.signMessageAndVerify(accountInfo.address, message);
  }

  async network(): Promise<NetworkInfo> {
    if (!this.provider) {
      throw new Error('Provider is not defined');
    }

    const { nodeUrl } = this.provider.aptos.aptosConfig;

    if (nodeUrl.includes(APTOS_NODE_URLS.MAINNET)) {
      return APTOS_NETWORKS[APTOS_NODE_URLS.MAINNET];
    }

    if (nodeUrl.includes(APTOS_NODE_URLS.TESTNET)) {
      return APTOS_NETWORKS[APTOS_NODE_URLS.TESTNET];
    }

    if (nodeUrl.includes(APTOS_NODE_URLS.DEVNET)) {
      return APTOS_NETWORKS[APTOS_NODE_URLS.DEVNET];
    }

    throw new Error('Invalid node url');
  }

  wallet(): WalletInfo {
    return {
      name: this.name,
      url: this.url,
      icon: this.icon,
    };
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
