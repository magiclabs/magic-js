import { MagicPayloadMethod, RequestUserInfoScope, UserInfo, WalletInfo } from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { clearKeys } from '../util/web-crypto';

export class WalletModule extends BaseModule {
  /* Prompt Magic's Login Form */
  public connectWithUI() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.RequestAccounts);
    return this.request<string[]>(requestPayload);
  }

  /* Prompt Magic's Wallet UI (not available for users logged in with third party wallets) */
  public showUI() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.ShowUI);
    return this.request<boolean>(requestPayload);
  }

  /* Get user info such as the wallet type they are logged in with */
  public getInfo() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetInfo);
    return this.request<WalletInfo>(requestPayload);
  }

  /* Request email address from logged in user */
  public requestUserInfoWithUI(scope?: RequestUserInfoScope) {
    const requestPayload = createJsonRpcRequestPayload(
      MagicPayloadMethod.RequestUserInfoWithUI,
      scope ? [{ scope }] : [],
    );
    return this.request<UserInfo>(requestPayload);
  }

  /* Logout user */
  public disconnect() {
    clearKeys();
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Disconnect);
    return this.request<boolean>(requestPayload);
  }
}
