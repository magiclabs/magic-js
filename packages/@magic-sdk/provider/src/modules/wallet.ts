import {
  GasApiResponse,
  MagicPayloadMethod,
  GaslessTransactionRequest,
  RequestUserInfoScope,
  UserInfo,
  WalletInfo,
  ConnectWithUIOptions,
  ConnectWithUiEvents,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { createDeprecationWarning } from '../core/sdk-exceptions';
import { ProductConsolidationMethodRemovalVersions } from './auth';
import { createPromiEvent } from '../util';
import { clearDeviceShares } from '../util/device-share-web-crypto';

export class WalletModule extends BaseModule {
  /* Prompt Magic's Login Form */
  public connectWithUI(options?: ConnectWithUIOptions) {
    const promiEvent = createPromiEvent<string[], ConnectWithUiEvents>(async (resolve, reject) => {
      try {
        const loginRequestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Login, [
          {
            enabledWallets: this.sdk.thirdPartyWallets.enabledWallets,
            ...options,
          },
        ]);

        const loginRequest = this.request<string[], ConnectWithUiEvents>(loginRequestPayload);

        this.sdk.thirdPartyWallets.eventListeners.forEach(({ event, callback }) => {
          loginRequest.on(event, () => callback(loginRequestPayload.id as string));
        });

        loginRequest.on('id-token-created' as any, (params: { idToken: string }) => {
          promiEvent.emit('id-token-created', params);
        });

        const result = await loginRequest;
        if ((result as any).error) reject(result);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    return promiEvent;
  }

  /* Prompt Magic's Wallet UI (not available for users logged in with third party wallets) */
  public showUI() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowUI));
  }

  public showAddress() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowAddress));
  }

  public showSendTokensUI() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowSendTokensUI));
  }

  public showOnRamp() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowOnRamp));
  }

  public showNFTs() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowNFTs));
  }

  public showBalances() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowBalances));
  }

  public sendGaslessTransaction(address: string, transaction: GaslessTransactionRequest) {
    return this.request<GasApiResponse>(
      createJsonRpcRequestPayload(MagicPayloadMethod.SendGaslessTransaction, [address, transaction]),
    );
  }

  /* Get user info such as the wallet type they are logged in with */
  // deprecating
  public getInfo() {
    createDeprecationWarning({
      method: 'wallet.getInfo()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: 'user.getInfo()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetInfo, []);
    return this.request<WalletInfo>(requestPayload);
  }

  /* Logout user */
  // deprecating
  public disconnect() {
    createDeprecationWarning({
      method: 'wallet.disconnect()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: 'user.logout()',
    }).log();
    clearDeviceShares();
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Disconnect);
    return this.request<boolean>(requestPayload);
  }

  /* Request email address from logged in user */
  // deprecating
  public requestUserInfoWithUI(scope?: RequestUserInfoScope) {
    createDeprecationWarning({
      method: 'wallet.requestUserInfoWithUI()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: 'user.requestUserInfoWithUI()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.RequestUserInfoWithUI, scope ? [scope] : []);
    return this.request<UserInfo>(requestPayload);
  }
}
