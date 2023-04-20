import {
  GetIdTokenConfiguration,
  MagicPayloadMethod,
  MagicUserMetadata,
  GenerateIdTokenConfiguration,
  UpdateEmailConfiguration,
  UserInfo,
  RequestUserInfoScope,
  RecoverAccountConfiguration,
  ShowSettingsConfiguration,
} from '@magic-sdk/types';
import { getItem, removeItem } from '../util/storage';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { clearKeys } from '../util/web-crypto';
import { createDeprecationWarning } from '../core/sdk-exceptions';

export type UpdateEmailEvents = {
  'email-sent': () => void;
  'email-not-deliverable': () => void;
  'old-email-confirmed': () => void;
  'new-email-confirmed': () => void;
  retry: () => void;
};
export class UserModule extends BaseModule {
  public getIdToken(configuration?: GetIdTokenConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.GetIdTokenTestMode : MagicPayloadMethod.GetIdToken,
      [configuration],
    );
    return this.request<string>(requestPayload);
  }

  public generateIdToken(configuration?: GenerateIdTokenConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.GenerateIdTokenTestMode : MagicPayloadMethod.GenerateIdToken,
      [configuration],
    );
    return this.request<string>(requestPayload);
  }

  public async getInfo() {
    const activeWallet = await getItem(this.localForageKey);
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetInfo, [{ walletType: activeWallet }]);
    return this.request<MagicUserMetadata>(requestPayload);
  }

  public isLoggedIn() {
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.IsLoggedInTestMode : MagicPayloadMethod.IsLoggedIn,
    );
    return this.request<boolean>(requestPayload);
  }

  public logout() {
    clearKeys();
    removeItem(this.localForageKey);
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.LogoutTestMode : MagicPayloadMethod.Logout,
    );
    return this.request<boolean>(requestPayload);
  }

  /* Request email address from logged in user */
  public requestInfoWithUI(scope?: RequestUserInfoScope) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.RequestUserInfoWithUI, scope ? [scope] : []);
    return this.request<UserInfo>(requestPayload);
  }

  public showSettings(configuration?: ShowSettingsConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.UserSettingsTestMode : MagicPayloadMethod.UserSettings,
      [configuration],
    );
    return this.request<MagicUserMetadata>(requestPayload);
  }

  public recoverAccount(configuration: RecoverAccountConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.RecoverAccountTestMode : MagicPayloadMethod.RecoverAccount,
      [configuration],
    );
    return this.request<boolean | null>(requestPayload);
  }

  // Deprecating
  public getMetadata() {
    createDeprecationWarning({
      method: 'user.getMetadata()',
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
      useInstead: 'user.getInfo()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.GetMetadataTestMode : MagicPayloadMethod.GetMetadata,
    );
    return this.request<MagicUserMetadata>(requestPayload);
  }

  // Deprecating
  public updateEmail(configuration: UpdateEmailConfiguration) {
    createDeprecationWarning({
      method: 'user.updateEmail()',
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
      useInstead: 'auth.updateEmailWithUI()',
    }).log();
    const { email, showUI = true } = configuration;
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.UpdateEmailTestMode : MagicPayloadMethod.UpdateEmail,
      [{ email, showUI }],
    );
    return this.request<string | null, UpdateEmailEvents>(requestPayload);
  }

  // Deprecating
  public updatePhoneNumber() {
    createDeprecationWarning({
      method: 'user.updatePhoneNumber()',
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
      useInstead: 'auth.updatePhoneNumberWithUI()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.UpdatePhoneNumberTestMode : MagicPayloadMethod.UpdatePhoneNumber,
    );
    return this.request<string | null>(requestPayload);
  }

  // Private members
  private localForageKey = 'mc_active_wallet';
}
