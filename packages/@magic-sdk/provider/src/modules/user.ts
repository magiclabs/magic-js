import {
  GetIdTokenConfiguration,
  MagicPayloadMethod,
  MagicUserMetadata,
  GenerateIdTokenConfiguration,
  UserInfo,
  RequestUserInfoScope,
  RecoverAccountConfiguration,
  ShowSettingsConfiguration,
  EnableMFAConfiguration,
  EnableMFAEventEmit,
  EnableMFAEventHandlers,
  DisableMFAConfiguration,
  DisableMFAEventHandlers,
  DisableMFAEventEmit,
  RecencyCheckEventEmit,
  RecoveryFactorEventHandlers,
  RecoveryFactorEventEmit,
  RecoverAccountEventHandlers,
  RecoverAccountEventEmit,
  UpdateEmailEventHandlers,
  UpdateEmailEventEmit,
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
    const { showUI = true } = configuration || {};
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.UserSettingsTestMode : MagicPayloadMethod.UserSettings,
      [configuration],
    );
    const handle = this.request<string | null, RecoveryFactorEventHandlers>(requestPayload);
    if (!showUI && handle) {
      handle.on(RecoveryFactorEventEmit.SendNewPhoneNumber, (phone_number: string) => {
        this.createIntermediaryEvent(
          RecoveryFactorEventEmit.SendNewPhoneNumber,
          requestPayload.id as string,
        )(phone_number);
      });
      handle.on(RecoveryFactorEventEmit.SendOtpCode, (otp: string) => {
        this.createIntermediaryEvent(RecoveryFactorEventEmit.SendOtpCode, requestPayload.id as string)(otp);
      });
      handle.on(RecoveryFactorEventEmit.StartEditPhoneNumber, () => {
        this.createIntermediaryEvent(RecoveryFactorEventEmit.StartEditPhoneNumber, requestPayload.id as string)();
      });
      handle.on(RecoveryFactorEventEmit.Cancel, () => {
        this.createIntermediaryEvent(RecoveryFactorEventEmit.Cancel, requestPayload.id as string)();
      });
      handle.on(RecencyCheckEventEmit.VerifyEmailOtp, (otp: string) => {
        this.createIntermediaryEvent(RecencyCheckEventEmit.VerifyEmailOtp, requestPayload.id as string)(otp);
      });
    }
    return handle;
  }

  public recoverAccount(configuration: RecoverAccountConfiguration) {
    const { email, showUI } = configuration;
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.RecoverAccountTestMode : MagicPayloadMethod.RecoverAccount,
      [{ email, showUI }],
    );
    const handle = this.request<string | boolean | null, RecoverAccountEventHandlers & UpdateEmailEventHandlers>(
      requestPayload,
    );

    if (!showUI && handle) {
      handle.on(RecoverAccountEventEmit.Cancel, () => {
        this.createIntermediaryEvent(RecoverAccountEventEmit.Cancel, requestPayload.id as string)();
      });
      handle.on(RecoverAccountEventEmit.ResendSms, () => {
        this.createIntermediaryEvent(RecoverAccountEventEmit.ResendSms, requestPayload.id as string)();
      });
      handle.on(RecoverAccountEventEmit.VerifyOtp, (otp: string) => {
        this.createIntermediaryEvent(RecoverAccountEventEmit.VerifyOtp, requestPayload.id as string)(otp);
      });
      handle.on(RecoverAccountEventEmit.UpdateEmail, (newEmail: string) => {
        this.createIntermediaryEvent(RecoverAccountEventEmit.UpdateEmail, requestPayload.id as string)(newEmail);
      });

      handle.on(UpdateEmailEventEmit.Cancel, () => {
        this.createIntermediaryEvent(UpdateEmailEventEmit.Cancel, requestPayload.id as string)();
      });
      handle.on(UpdateEmailEventEmit.RetryWithNewEmail, (newEmail?) => {
        this.createIntermediaryEvent(UpdateEmailEventEmit.RetryWithNewEmail, requestPayload.id as string)(newEmail);
      });

      handle.on(UpdateEmailEventEmit.VerifyEmailOtp, (otp: string) => {
        this.createIntermediaryEvent(UpdateEmailEventEmit.VerifyEmailOtp, requestPayload.id as string)(otp);
      });
    }

    return handle;
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

  public enableMFA(configuration: EnableMFAConfiguration) {
    const { showUI = true } = configuration;
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.EnableMFA, [{ showUI }]);
    const handle = this.request<string | boolean | null, EnableMFAEventHandlers>(requestPayload);

    if (!showUI && handle) {
      handle.on(EnableMFAEventEmit.VerifyMFACode, (totp: string) => {
        this.createIntermediaryEvent(EnableMFAEventEmit.VerifyMFACode, requestPayload.id as string)(totp);
      });

      handle.on(EnableMFAEventEmit.Cancel, () => {
        this.createIntermediaryEvent(EnableMFAEventEmit.Cancel, requestPayload.id as string)();
      });
    }
    return handle;
  }

  public disableMFA(configuration: DisableMFAConfiguration) {
    const { showUI = true } = configuration;

    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.DisableMFA, [{ showUI }]);
    const handle = this.request<string | boolean | null, DisableMFAEventHandlers>(requestPayload);

    if (!showUI && handle) {
      handle.on(DisableMFAEventEmit.VerifyMFACode, (totp: string) => {
        this.createIntermediaryEvent(DisableMFAEventEmit.VerifyMFACode, requestPayload.id as string)(totp);
      });

      handle.on(DisableMFAEventEmit.LostDevice, (recoveryCode: string) => {
        this.createIntermediaryEvent(DisableMFAEventEmit.LostDevice, requestPayload.id as string)(recoveryCode);
      });

      handle.on(DisableMFAEventEmit.Cancel, () => {
        this.createIntermediaryEvent(DisableMFAEventEmit.Cancel, requestPayload.id as string)();
      });
    }
    return handle;
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
