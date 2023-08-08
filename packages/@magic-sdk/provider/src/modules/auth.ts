import {
  MagicPayloadMethod,
  LoginWithMagicLinkConfiguration,
  LoginWithSmsConfiguration,
  LoginWithEmailOTPConfiguration,
  LoginWithEmailOTPEventHandlers,
  LoginWithMagicLinkEventHandlers,
  UpdateEmailConfiguration,
  DeviceVerificationEventEmit,
  LoginWithEmailOTPEventEmit,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { SDKEnvironment } from '../core/sdk-environment';
import { UpdateEmailEvents } from './user';
import { createDeprecationWarning } from '../core/sdk-exceptions';
import { isMajorVersionAtLeast } from '../util/version-check';

export const ProductConsolidationMethodRemovalVersions = {
  'magic-sdk': 'v18.0.0',
  '@magic-sdk/react-native': 'v14.0.0',
  '@magic-sdk/react-native-bare': 'v19.0.0',
  '@magic-sdk/react-native-expo': 'v19.0.0',
};

export class AuthModule extends BaseModule {
  /**
   * Initiate the "magic link" login flow for a user. If the flow is successful,
   * this method will return a Decentralized ID token (with a default lifespan
   * of 15 minutes).
   */
  public loginWithMagicLink(configuration: LoginWithMagicLinkConfiguration) {
    const isRNMobilePackage =
      SDKEnvironment.sdkName === '@magic-sdk/react-native' ||
      SDKEnvironment.sdkName === '@magic-sdk/react-native-bare' ||
      SDKEnvironment.sdkName === '@magic-sdk/react-native-expo';

    if (isRNMobilePackage && isMajorVersionAtLeast(SDKEnvironment.version, 19)) {
      throw new Error(
        'loginWithMagicLink() is deprecated for this package, please utlize a passcode method like loginWithSMS or loginWithEmailOTP instead.',
      );
    }

    createDeprecationWarning({
      method: 'auth.loginWithMagicLink()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: isRNMobilePackage
        ? '@magic-ext/auth auth.loginWithEmailOTP()'
        : '@magic-ext/auth auth.loginWithMagicLink()',
    }).log();

    const { email, showUI = true, redirectURI } = configuration;

    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.LoginWithMagicLinkTestMode : MagicPayloadMethod.LoginWithMagicLink,
      [{ email, showUI, redirectURI }],
    );
    return this.request<string | null, LoginWithMagicLinkEventHandlers>(requestPayload);
  }

  /**
   * Initiate an SMS login flow for a user. If successful,
   * this method will return a Decenteralized ID token (with a default lifespan
   * of 15 minutes)
   */
  public loginWithSMS(configuration: LoginWithSmsConfiguration) {
    createDeprecationWarning({
      method: 'auth.loginWithSMS()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: '@magic-ext/auth auth.loginWithSMS()',
    }).log();
    const { phoneNumber } = configuration;
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.LoginWithSmsTestMode : MagicPayloadMethod.LoginWithSms,
      [{ phoneNumber, showUI: true }],
    );
    return this.request<string | null>(requestPayload);
  }

  /**
   * Initiate an Email with OTP login flow for a user. If successful,
   * this method will return a Decenteralized ID token (with a default lifespan
   * of 15 minutes)
   */
  public loginWithEmailOTP(configuration: LoginWithEmailOTPConfiguration) {
    const { email, showUI, deviceCheckUI } = configuration;
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.LoginWithEmailOTPTestMode : MagicPayloadMethod.LoginWithEmailOTP,
      [{ email, showUI, deviceCheckUI }],
    );
    const handle = this.request<string | null, LoginWithEmailOTPEventHandlers>(requestPayload);
    if (!deviceCheckUI && handle) {
      handle.on(DeviceVerificationEventEmit.Retry, () => {
        this.createIntermediaryEvent(DeviceVerificationEventEmit.Retry, requestPayload.id as any)();
      });
    }
    if (!showUI && handle) {
      handle.on(LoginWithEmailOTPEventEmit.VerifyEmailOtp, (otp: string) => {
        this.createIntermediaryEvent(LoginWithEmailOTPEventEmit.VerifyEmailOtp, requestPayload.id as any)(otp);
      });
      handle.on(LoginWithEmailOTPEventEmit.Cancel, () => {
        this.createIntermediaryEvent(LoginWithEmailOTPEventEmit.Cancel, requestPayload.id as any)();
      });
    }
    return handle;
  }

  /**
   * Log a user in with a special one-time-use credential token. This is
   * currently used during magic link flows with a configured redirect to
   * hydrate the user session at the end of the flow. If the flow is successful,
   * this method will return a Decentralized ID token (with a default lifespan
   * of 15 minutes).
   *
   * If no argument is provided, a credential is automatically parsed from
   * `window.location.search`.
   */
  public loginWithCredential(credentialOrQueryString?: string) {
    createDeprecationWarning({
      method: 'auth.loginWithCredential()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: '@magic-ext/auth auth.loginWithCredential()',
    }).log();
    let credentialResolved = credentialOrQueryString ?? '';

    if (!credentialOrQueryString && SDKEnvironment.platform === 'web') {
      credentialResolved = window.location.search;

      // Remove the query from the redirect callback as a precaution.
      const urlWithoutQuery = window.location.origin + window.location.pathname;
      window.history.replaceState(null, '', urlWithoutQuery);
    }

    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.LoginWithCredentialTestMode : MagicPayloadMethod.LoginWithCredential,
      [credentialResolved],
    );

    return this.request<string | null>(requestPayload);
  }

  // Custom Auth
  public setAuthorizationToken(jwt: string) {
    createDeprecationWarning({
      method: 'auth.setAuthorizationToken()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: '@magic-ext/auth auth.setAuthorizationToken()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.SetAuthorizationToken, [{ jwt }]);
    return this.request<boolean>(requestPayload);
  }

  public updateEmailWithUI(configuration: UpdateEmailConfiguration) {
    createDeprecationWarning({
      method: 'auth.updateEmailWithUI()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: '@magic-ext/auth auth.updateEmailWithUI()',
    }).log();
    const { email, showUI = true } = configuration;
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.UpdateEmailTestMode : MagicPayloadMethod.UpdateEmail,
      [{ email, showUI }],
    );
    return this.request<string | null, UpdateEmailEvents>(requestPayload);
  }

  public updatePhoneNumberWithUI() {
    createDeprecationWarning({
      method: 'auth.updatePhoneNumberWithUI()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: '@magic-ext/auth auth.updatePhoneNumberWithUI()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.UpdatePhoneNumberTestMode : MagicPayloadMethod.UpdatePhoneNumber,
    );
    return this.request<string | null>(requestPayload);
  }
}
