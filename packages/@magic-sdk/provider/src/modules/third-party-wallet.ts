import { JsonRpcRequestPayload, MagicPayloadMethod, MagicUserMetadata, ThirdPartyWalletEvents } from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { PromiEvent, createPromiEvent } from '../util';

export class ThirdPartyWalletModule extends BaseModule {
  public eventListeners: { event: ThirdPartyWalletEvents; callback: (payloadId: string) => Promise<void> }[] = [];
  public enabledWallets: Record<string, boolean> = {};
  public isConnected = false;

  public resetState() {
    localStorage.removeItem('magic_3pw_provider');
    localStorage.removeItem('magic_3pw_address');
    localStorage.removeItem('magic_3pw_chainId');
    this.isConnected = false;
  }

  public requestOverride(payload: Partial<JsonRpcRequestPayload>) {
    // Handle method overrides if login/getInfo/isLoggedIn/logout
    if (payload.method === MagicPayloadMethod.Login) {
      this.resetState();
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
    switch (localStorage.getItem('magic_3pw_provider')) {
      case 'web3modal':
        return this.web3modalRequest(payload);
      // Fallback to default request
      default:
        this.resetState();
        return super.request(payload);
    }
  }

  /* Core Method Overrides */

  private isLoggedIn(payload: Partial<JsonRpcRequestPayload>): PromiEvent<boolean> {
    switch (localStorage.getItem('magic_3pw_provider')) {
      case 'web3modal':
        return this.web3modalIsLoggedIn();
      default:
        this.resetState();
        return super.request(payload);
    }
  }

  private getInfo(payload: Partial<JsonRpcRequestPayload>): PromiEvent<MagicUserMetadata> {
    switch (localStorage.getItem('magic_3pw_provider')) {
      case 'web3modal':
        return this.web3modalGetInfo();
      default:
        this.resetState();
        return super.request(payload);
    }
  }

  private logout(payload: Partial<JsonRpcRequestPayload>): PromiEvent<boolean> {
    const provider = localStorage.getItem('magic_3pw_provider');
    this.resetState();
    switch (provider) {
      case 'web3modal': {
        return this.web3modalLogout();
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
    return createPromiEvent<boolean>((resolve) => {
      // Required delay to allow web3modal to register connection
      setTimeout(() => {
        // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
        const isLoggedIn: boolean = this.sdk.web3modal.modal.getIsConnected();
        resolve(isLoggedIn);
      }, 50);
    });
  }

  private web3modalGetInfo() {
    return createPromiEvent<MagicUserMetadata>((resolve) => {
      // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
      const walletType = this.sdk.web3modal.modal.getWalletInfo()?.name;
      // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
      const userAddress = this.sdk.web3modal.modal.getAddress();
      resolve({
        publicAddress: userAddress,
        email: null,
        issuer: `$did:ethr:${userAddress}`,
        phoneNumber: null,
        isMfaEnabled: false,
        recoveryFactors: [],
        walletType,
      });
    });
  }

  private web3modalLogout(): PromiEvent<boolean> {
    return createPromiEvent<boolean>(async (resolve) => {
      try {
        // @ts-expect-error Property 'web3modal' does not exist on type 'SDKBase'.
        await this.sdk.web3modal.modal.disconnect();
      } catch (error) {
        console.error(error);
      }
      resolve(true);
    });
  }
}
