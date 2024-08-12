import {
  GetIdTokenConfiguration,
  MagicPayloadMethod,
  MagicUserMetadata,
  GenerateIdTokenConfiguration,
  UserInfo,
  RequestUserInfoScope,
  RecoverAccountConfiguration,
  ShowSettingsConfiguration,
} from '@magic-sdk/types';
import { getItem, setItem, removeItem } from '../util/storage';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { createDeprecationWarning } from '../core/sdk-exceptions';
import { ProductConsolidationMethodRemovalVersions } from './auth';
import { clearDeviceShares } from '../util/device-share-web-crypto';
import { createPromiEvent } from '../util';

type UserLoggedOutCallback = (loggedOut: boolean) => void;

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
    return createPromiEvent<boolean, any>(async (resolve, reject) => {
      try {
        let cachedIsLoggedIn = false;
        if (this.sdk.useStorageCache) {
          cachedIsLoggedIn = (await getItem(this.localForageIsLoggedInKey)) === 'true';

          // if isLoggedIn is true on storage, optimistically resolve with true
          // if it is false, we use `usr.isLoggedIn` as the source of truth.
          if (cachedIsLoggedIn) {
            resolve(true);
          }
        }

        const requestPayload = createJsonRpcRequestPayload(
          this.sdk.testMode ? MagicPayloadMethod.IsLoggedInTestMode : MagicPayloadMethod.IsLoggedIn,
        );
        const isLoggedInResponse = await this.request<boolean>(requestPayload);
        if (this.sdk.useStorageCache) {
          if (isLoggedInResponse) {
            setItem(this.localForageIsLoggedInKey, true);
          } else {
            removeItem(this.localForageIsLoggedInKey);
          }
          if (cachedIsLoggedIn && !isLoggedInResponse) {
            this.emitUserLoggedOut(true);
          }
        }
        resolve(isLoggedInResponse);
      } catch (err) {
        reject(err);
      }
    });
  }

  public logout() {
    removeItem(this.localForageKey);
    removeItem(this.localForageIsLoggedInKey);
    clearDeviceShares();

    return createPromiEvent<boolean, any>(async (resolve, reject) => {
      try {
        const requestPayload = createJsonRpcRequestPayload(
          this.sdk.testMode ? MagicPayloadMethod.LogoutTestMode : MagicPayloadMethod.Logout,
        );
        const response = await this.request<boolean>(requestPayload);
        if (this.sdk.useStorageCache) {
          this.emitUserLoggedOut(response);
        }
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
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

  public revealPrivateKey() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.RevealPK);
    return this.request<boolean>(requestPayload);
  }

  // Deprecating
  public getMetadata() {
    createDeprecationWarning({
      method: 'user.getMetadata()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: 'user.getInfo()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.GetMetadataTestMode : MagicPayloadMethod.GetMetadata,
    );
    return this.request<MagicUserMetadata>(requestPayload);
  }

  public onUserLoggedOut(callback: UserLoggedOutCallback): void {
    this.userLoggedOutCallbacks.push(callback);
  }

  public enableMFA() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.EnableMFA);
    return this.request<boolean>(requestPayload);
  }

  public disableMFA() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.DisableMFA);
    return this.request<boolean>(requestPayload);
  }

  // Private members
  private emitUserLoggedOut(loggedOut: boolean): void {
    this.userLoggedOutCallbacks.forEach((callback) => {
      callback(loggedOut);
    });
  }

  private localForageKey = 'mc_active_wallet';
  private localForageIsLoggedInKey = 'magic_auth_is_logged_in';
  private userLoggedOutCallbacks: UserLoggedOutCallback[] = [];
}
