import {
  JsonRpcError,
  JsonRpcRequestPayload,
  LocalStorageKeys,
  MagicPayloadMethod,
  MagicThirdPartyWalletRequest,
  MagicUserMetadata,
  ThirdPartyWalletEvents,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { PromiEvent, createPromiEvent } from '../util';
import { MagicRPCError } from '../core/sdk-exceptions';

export class ThirdPartyWalletsModule extends BaseModule {
  public eventListeners: { event: ThirdPartyWalletEvents; callback: (payloadId: string) => Promise<void> }[] = [];
  public enabledWallets: Record<string, boolean> = {};
  public isConnected = false;

  public resetThirdPartyWalletState() {
    localStorage.removeItem(LocalStorageKeys.PROVIDER);
    localStorage.removeItem(LocalStorageKeys.ADDRESS);
    localStorage.removeItem(LocalStorageKeys.CHAIN_ID);
    this.isConnected = false;
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
    switch (localStorage.getItem(LocalStorageKeys.PROVIDER)) {
      case 'magic-widget':
        return this.magicWidgetRequest(payload);
      // Fallback to default request
      default:
        this.resetThirdPartyWalletState();
        return super.request(payload);
    }
  }

  /* Core Method Overrides */

  private isLoggedIn(payload: Partial<JsonRpcRequestPayload>): PromiEvent<boolean> {
    switch (localStorage.getItem(LocalStorageKeys.PROVIDER)) {
      case 'magic-widget':
        return super.requestOverlay(payload);
      default:
        this.resetThirdPartyWalletState();
        return super.request(payload);
    }
  }

  private getInfo(payload: Partial<JsonRpcRequestPayload>): PromiEvent<MagicUserMetadata> {
    switch (localStorage.getItem(LocalStorageKeys.PROVIDER)) {
      case 'magic-widget':
        return super.requestOverlay(payload);
      default:
        this.resetThirdPartyWalletState();
        return super.request(payload);
    }
  }

  private logout(payload: Partial<JsonRpcRequestPayload>): PromiEvent<boolean> {
    const provider = localStorage.getItem(LocalStorageKeys.PROVIDER);
    this.resetThirdPartyWalletState();
    switch (provider) {
      case 'magic-widget': {
        return this.magicWidgetLogout(payload);
      }
      default:
        return super.request(payload);
    }
  }

  /* Magic Widget Methods */

  private magicWidgetRequest(payload: Partial<JsonRpcRequestPayload>) {
    const ethRpcPrefixes = ['eth_', 'wallet_', 'net_', 'web3_'];
    const isEthRequest = ethRpcPrefixes.some(prefix => payload.method?.startsWith(prefix));
    const SIGN_REQUESTS = ['personal_sign'];

    if (isEthRequest || SIGN_REQUESTS.includes(payload.method as string)) {
      return createPromiEvent<unknown>((resolve, reject) => {
        // @ts-expect-error Property 'walletKit' does not exist on type 'SDKBase'.
        this.sdk.walletKit
          .walletRequest(payload)
          .then(resolve)
          .catch((error: unknown) => reject(new MagicRPCError(error as JsonRpcError)));
      });
    }

    return super.requestOverlay(payload);
  }

  private magicWidgetLogout(payload: Partial<JsonRpcRequestPayload>): PromiEvent<boolean> {
    return createPromiEvent<boolean>(async resolve => {
      try {
        // @ts-expect-error Property 'walletKit' does not exist on type 'SDKBase'.
        this.sdk.walletKit.clearConnectedState();
      } catch (error) {
        console.error(error);
      }

      return super.requestOverlay(payload);
    });
  }

  public handleIframeThirdPartyWalletRequest(event: MagicThirdPartyWalletRequest) {
    this.magicWidgetRequest(event.payload)
      .then(response => {
        this.overlay.postThirdPartyWalletResponse({
          id: event.payload.id,
          jsonrpc: '2.0',
          result: response,
        });
      })
      .catch(error => {
        this.overlay.postThirdPartyWalletResponse({
          id: event.payload.id,
          jsonrpc: '2.0',
          error: {
            code: error.code || -32603,
            message: error.message || 'Internal error',
            data: error.data,
          },
        });
      });
  }
}
