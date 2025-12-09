import {
  JsonRpcRequestPayload,
  LocalStorageKeys,
  MagicPayloadMethod,
  MagicUserMetadata,
  ThirdPartyWalletEvents,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { PromiEvent, createPromiEvent } from '../util';

type ExternalProvider = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

export class ThirdPartyWalletsModule extends BaseModule {
  public eventListeners: { event: ThirdPartyWalletEvents; callback: (payloadId: string) => Promise<void> }[] = [];
  public enabledWallets: Record<string, boolean> = {};
  public isConnected = false;
  public activeProvider: ExternalProvider | null = null;
  private externalDisconnect: (() => Promise<void>) | null = null;
  public activeWalletKey: string | null = null;

  public resetThirdPartyWalletState() {
    localStorage.removeItem(LocalStorageKeys.PROVIDER);
    localStorage.removeItem(LocalStorageKeys.ADDRESS);
    localStorage.removeItem(LocalStorageKeys.CHAIN_ID);
    this.isConnected = false;
    this.activeProvider = null;
    this.externalDisconnect = null;
    this.activeWalletKey = null;
  }

  public setExternalProvider(
    provider: ExternalProvider | null | undefined,
    options?: { disconnect?: () => Promise<void>; walletKey?: string | null },
  ) {
    this.activeProvider = (provider ?? null) as ExternalProvider | null;
    this.externalDisconnect = options?.disconnect ?? null;
    this.activeWalletKey = options?.walletKey ?? null;
  }

  public requestOverride(payload: Partial<JsonRpcRequestPayload>) {
    // Handle method overrides if login/getInfo/isLoggedIn/logout
    if (payload.method === MagicPayloadMethod.Login) {
      this.resetThirdPartyWalletState();
      return super.request(payload);
    }
    if (payload.method === MagicPayloadMethod.GetInfo) {
      return this.getInfo(payload);
    }
    if (payload.method === MagicPayloadMethod.IsLoggedIn) {
      return this.isLoggedIn(payload);
    }
    if (payload.method === MagicPayloadMethod.Logout) {
      return this.logout(payload);
    }
    // Route all other requests to 3pw provider
    const provider = localStorage.getItem(LocalStorageKeys.PROVIDER);
    switch (provider) {
      case 'web3modal':
        return this.web3modalRequest(payload);
      case 'metamask':
      case 'coinbase':
      case 'phantom':
      case 'rabby':
        return this.externalProviderRequest(payload);
      default:
        this.resetThirdPartyWalletState();
        return super.request(payload);
    }
  }

  /* Core Method Overrides */

  private isLoggedIn(payload: Partial<JsonRpcRequestPayload>): PromiEvent<boolean> {
    const provider = localStorage.getItem(LocalStorageKeys.PROVIDER);
    switch (provider) {
      case 'web3modal':
        return this.web3modalIsLoggedIn();
      case 'metamask':
      case 'coinbase':
      case 'phantom':
      case 'rabby':
        return this.externalIsLoggedIn();
      default:
        this.resetThirdPartyWalletState();
        return super.request(payload);
    }
  }

  private getInfo(payload: Partial<JsonRpcRequestPayload>): PromiEvent<MagicUserMetadata> {
    const provider = localStorage.getItem(LocalStorageKeys.PROVIDER);
    switch (provider) {
      case 'web3modal':
        return this.web3modalGetInfo();
      case 'metamask':
      case 'coinbase':
      case 'phantom':
      case 'rabby':
        return this.externalGetInfo(provider ?? '');
      default:
        this.resetThirdPartyWalletState();
        return super.request(payload);
    }
  }

  private logout(payload: Partial<JsonRpcRequestPayload>): PromiEvent<boolean> {
    const provider = localStorage.getItem(LocalStorageKeys.PROVIDER);
    this.resetThirdPartyWalletState();
    switch (provider) {
      case 'web3modal': {
        return this.web3modalLogout();
      }
      case 'metamask':
      case 'coinbase':
      case 'phantom':
      case 'rabby': {
        return this.externalLogout();
      }
      default:
        return super.request(payload);
    }
  }

  /* Web3Modal Methods */

  private web3modalRequest(payload: Partial<JsonRpcRequestPayload>) {
    return createPromiEvent<unknown>((resolve, reject) => {
      // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
      this.sdk.web3modal.modal.getWalletProvider().request(payload).then(resolve).catch(reject);
    });
  }

  private web3modalIsLoggedIn() {
    return createPromiEvent<boolean>(resolve => {
      // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
      const walletStatus = this.sdk.web3modal.modal.getStatus();
      if (walletStatus === 'connected') {
        resolve(true);
      }
      if (walletStatus === 'disconnected') {
        this.resetThirdPartyWalletState();
        resolve(false);
      }
      if (walletStatus === 'reconnecting') {
        // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
        const unsubscribeFromProviderEvents = this.sdk.web3modal.modal.subscribeProvider(({ status }) => {
          if (status === 'connected') {
            unsubscribeFromProviderEvents();
            resolve(true);
          }
          if (status === 'disconnected') {
            unsubscribeFromProviderEvents();
            this.resetThirdPartyWalletState();
            resolve(false);
          }
        });
      }
    });
  }

  private formatWeb3modalGetInfoResponse() {
    // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
    const walletType = this.sdk.web3modal.modal.getWalletInfo()?.name;
    // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
    const userAddress = this.sdk.web3modal.modal.getAddress();
    return {
      publicAddress: userAddress as string,
      email: null,
      issuer: `did:ethr:${userAddress}`,
      phoneNumber: null,
      isMfaEnabled: false,
      recoveryFactors: [] as [],
      walletType: walletType || 'web3modal',
      firstLoginAt: null,
    };
  }

  private web3modalGetInfo() {
    return createPromiEvent<MagicUserMetadata>((resolve, reject) => {
      // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
      const walletStatus = this.sdk.web3modal.modal.getStatus();
      if (walletStatus === 'connected') {
        resolve(this.formatWeb3modalGetInfoResponse());
      }

      if (walletStatus === 'disconnected') {
        this.resetThirdPartyWalletState();
        reject('Magic RPC Error: [-32603] Internal error: User denied account access.');
      }

      if (walletStatus === 'reconnecting') {
        // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
        const unsubscribeFromProviderEvents = this.sdk.web3modal.modal.subscribeProvider(({ status }) => {
          if (status === 'connected') {
            unsubscribeFromProviderEvents();
            resolve(this.formatWeb3modalGetInfoResponse());
          }
          if (status === 'disconnected') {
            unsubscribeFromProviderEvents();
            this.resetThirdPartyWalletState();
            reject('Magic RPC Error: [-32603] Internal error: User denied account access.');
          }
        });
      }
    });
  }

  private web3modalLogout(): PromiEvent<boolean> {
    return createPromiEvent<boolean>(async resolve => {
      try {
        // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
        await this.sdk.web3modal.modal.disconnect();
      } catch (error) {
        console.error(error);
      }
      resolve(true);
    });
  }

  private externalProviderRequest(payload: Partial<JsonRpcRequestPayload>) {
    return createPromiEvent<unknown>((resolve, reject) => {
      if (!this.activeProvider) {
        this.resetThirdPartyWalletState();
        super.request(payload).then(resolve).catch(reject);
        return;
      }

      const { method, params } = payload;

      if (!method) {
        reject(new Error('Invalid JSON-RPC payload: missing method.'));
        return;
      }

      this.activeProvider
        .request({ method, params })
        .then(resolve)
        .catch(error => {
          this.resetThirdPartyWalletState();
          reject(error);
        });
    });
  }

  private externalIsLoggedIn() {
    return createPromiEvent<boolean>(resolve => {
      const address = localStorage.getItem(LocalStorageKeys.ADDRESS);
      resolve(Boolean(address && this.activeProvider));
    });
  }

  private externalGetInfo(walletType: string) {
    return createPromiEvent<MagicUserMetadata>((resolve, reject) => {
      if (!this.activeProvider) {
        this.resetThirdPartyWalletState();
        reject('Magic RPC Error: [-32603] Internal error: No active provider.');
        return;
      }

      const address = localStorage.getItem(LocalStorageKeys.ADDRESS);
      if (!address) {
        this.resetThirdPartyWalletState();
        reject('Magic RPC Error: [-32603] Internal error: User denied account access.');
        return;
      }

      resolve({
        publicAddress: address,
        email: null,
        issuer: `did:ethr:${address}`,
        phoneNumber: null,
        isMfaEnabled: false,
        recoveryFactors: [] as [],
        walletType,
        firstLoginAt: null,
      });
    });
  }

  private externalLogout(): PromiEvent<boolean> {
    return createPromiEvent<boolean>(async resolve => {
      try {
        if (this.externalDisconnect) {
          await this.externalDisconnect();
        }
        this.setExternalProvider(null);
      } catch (error) {
        console.error(error);
      }
      resolve(true);
    });
  }
}
