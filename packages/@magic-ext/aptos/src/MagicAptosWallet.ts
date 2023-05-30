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

export class MagicAptosWallet implements AdapterPlugin {
  readonly name = APTOS_WALLET_NAME;
  readonly url = 'https://magic.link/';
  readonly icon = ICON_BASE64;

  readonly providerName = 'magicWallet';

  provider: Magic<[AptosExtension]>;

  constructor(magic: Magic<[AptosExtension]>) {
    this.provider = magic;
  }

  async connect(): Promise<AccountInfo> {
    throw new Error('Please use connectWithMagicLink method');
  }

  async connectWithMagicLink({ email }: { email: string }): Promise<AccountInfo> {
    await this.provider.auth.loginWithMagicLink({ email });
    return this.provider.aptos.account();
  }

  async account(): Promise<AccountInfo> {
    return this.provider.aptos.account();
  }

  async disconnect(): Promise<void> {
    await this.provider.user.logout();
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any,
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    return this.provider.aptos.signAndSubmitTransaction(transaction, options);
  }

  async signAndSubmitBCSTransaction(
    transaction: TxnBuilderTypes.TransactionPayload,
    options?: any,
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    return this.provider.aptos.signAndSubmitBCSTransaction(transaction, options);
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    return this.provider.aptos.signMessage(message);
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
