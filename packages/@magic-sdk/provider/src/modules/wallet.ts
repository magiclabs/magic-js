import { MagicPayloadMethod, RequestUserInfoScope, UserInfo, WalletInfo } from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { clearKeys } from '../util/web-crypto';
import { createDeprecationWarning } from '../core/sdk-exceptions';

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
  // deprecating
  public getInfo() {
    createDeprecationWarning({
      method: 'wallet.getInfo()',
      removalVersions: {
        'magic-sdk': 'v17.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v18.0.0',
        '@magic-sdk/react-native-expo': 'v18.0.0',
      },
      useInstead: 'user.getInfo()',
    });
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetInfo);
    return this.request<WalletInfo>(requestPayload);
  }

  /* Logout user */
  // deprecating
  public disconnect() {
    createDeprecationWarning({
      method: 'wallet.disconnect()',
      removalVersions: {
        'magic-sdk': 'v17.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v18.0.0',
        '@magic-sdk/react-native-expo': 'v18.0.0',
      },
      useInstead: 'user.logout()',
    });
    clearKeys();
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Disconnect);
    return this.request<boolean>(requestPayload);
  }

  /* Request email address from logged in user */
  // deprecating
  public requestUserInfoWithUI(scope?: RequestUserInfoScope) {
    createDeprecationWarning({
      method: 'wallet.requestUserInfoWithUI()',
      removalVersions: {
        'magic-sdk': 'v17.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v18.0.0',
        '@magic-sdk/react-native-expo': 'v18.0.0',
      },
      useInstead: 'user.requestUserInfoWithUI()',
    });
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.RequestUserInfoWithUI, scope ? [scope] : []);
    return this.request<UserInfo>(requestPayload);
  }
}
