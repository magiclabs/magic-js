import {
  MagicPayloadMethod,
  LoginWithMagicLinkConfiguration,
  LoginWithSmsConfiguration,
  LoginWithEmailOTPConfiguration,
  LoginWithEmailOTPEvents,
  LoginWithMagicLinkEvents,
  UpdateEmailConfiguration,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { SDKEnvironment } from '../core/sdk-environment';
import { UpdateEmailEvents } from './user';
import { createDeprecationWarning } from '../core/sdk-exceptions';

export class AuthModule extends BaseModule {
  /**
   * Initiate the "magic link" login flow for a user. If the flow is successful,
   * this method will return a Decentralized ID token (with a default lifespan
   * of 15 minutes).
   */
  public loginWithMagicLink(configuration: LoginWithMagicLinkConfiguration) {
    createDeprecationWarning({
      method: 'auth.loginWithMagicLink()',
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
      useInstead: '@magic-ext/auth auth.loginWithMagicLink()',
    }).log();
    const { email, showUI = true, redirectURI } = configuration;

    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.LoginWithMagicLinkTestMode : MagicPayloadMethod.LoginWithMagicLink,
      [{ email, showUI, redirectURI }],
    );
    return this.request<string | null, LoginWithMagicLinkEvents>(requestPayload);
  }

  /**
   * Initiate an SMS login flow for a user. If successful,
   * this method will return a Decenteralized ID token (with a default lifespan
   * of 15 minutes)
   */
  public loginWithSMS(configuration: LoginWithSmsConfiguration) {
    createDeprecationWarning({
      method: 'auth.loginWithSMS()',
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
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
    createDeprecationWarning({
      method: 'auth.loginWithEmailOTP()',
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
      useInstead: '@magic-ext/auth auth.loginWithEmailOTP()',
    }).log();
    const { email, showUI } = configuration;
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.LoginWithEmailOTPTestMode : MagicPayloadMethod.LoginWithEmailOTP,
      [{ email, showUI }],
    );
    if (!showUI) {
      const handle = this.request<string | null, LoginWithEmailOTPEvents>(requestPayload);
      if (handle) {
        handle.on('verify-email-otp', (otp: string) => {
          this.createIntermediaryEvent('verify-email-otp', requestPayload.id as any)(otp);
        });
        handle.on('cancel', () => {
          this.createIntermediaryEvent('cancel', requestPayload.id as any)();
        });
      }
      return handle;
    }
    return this.request<string | null, LoginWithEmailOTPEvents>(requestPayload);
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
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
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
  public setAuthorizationToken() {
    createDeprecationWarning({
      method: 'auth.setAuthorizationToken()',
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
      useInstead: '@magic-ext/auth auth.setAuthorizationToken()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.SetAuthorizationToken);
    return this.request<boolean>(requestPayload);
  }

  public updateEmailWithUI(configuration: UpdateEmailConfiguration) {
    createDeprecationWarning({
      method: 'auth.updateEmailWithUI()',
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
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
      removalVersions: {
        'magic-sdk': 'v18.0.0',
        '@magic-sdk/react-native': 'v14.0.0',
        '@magic-sdk/react-native-bare': 'v19.0.0',
        '@magic-sdk/react-native-expo': 'v19.0.0',
      },
      useInstead: '@magic-ext/auth auth.updatePhoneNumberWithUI()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.UpdatePhoneNumberTestMode : MagicPayloadMethod.UpdatePhoneNumber,
    );
    return this.request<string | null>(requestPayload);
  }
}
