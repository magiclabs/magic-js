import {
  DeviceVerificationEventEmit,
  Extension,
  LoginWithEmailOTPConfiguration,
  LoginWithEmailOTPEventEmit,
  LoginWithEmailOTPEventHandlers,
  LoginWithMagicLinkConfiguration,
  LoginWithMagicLinkEventHandlers,
  LoginWithSmsConfiguration,
  MagicPayloadMethod,
  UpdateEmailConfiguration,
} from '@magic-sdk/commons';
import { ViewController, isMajorVersionAtLeast } from '@magic-sdk/provider';
import type localForage from 'localforage';

type ConstructorOf<C> = { new (...args: any[]): C };

interface SDKEnvironment {
  sdkName: 'magic-sdk' | '@magic-sdk/react-native' | '@magic-sdk/react-native-bare' | '@magic-sdk/react-native-expo';
  version: string;
  platform: 'web' | 'react-native';
  defaultEndpoint: string;
  defaultNFTEndpoint: string;
  ViewController: ConstructorOf<ViewController>;
  configureStorage: () => Promise<typeof localForage>;
  bundleId?: string | null;
}

const SDKEnvironment: SDKEnvironment = {} as any;

type UpdateEmailEventHandlers = {
  [UpdateEmailEventsOnReceived.EmailSent]: () => void;
  [UpdateEmailEventsOnReceived.EmailNotDeliverable]: () => void;
  [UpdateEmailEventsOnReceived.OldEmailConfirmed]: () => void;
  [UpdateEmailEventsOnReceived.NewEmailConfirmed]: () => void;
  [UpdateEmailEventsEmit.Retry]: () => void;
};

export enum UpdateEmailEventsEmit {
  Retry = 'retry',
}

export enum UpdateEmailEventsOnReceived {
  EmailSent = 'email-sent',
  EmailNotDeliverable = 'email-not-deliverable',
  OldEmailConfirmed = 'old-email-confirmed',
  NewEmailConfirmed = 'new-email-confirmed',
}

export class AuthExtension extends Extension.Internal<'auth', any> {
  name = 'auth' as const;
  config: any = {};

  /**
   * Initiate the "magic link" login flow for a user. If the flow is successful,
   * this method will return a Decentralized ID token (with a default lifespan
   * of 15 minutes).
   */
  public loginWithMagicLink(configuration: LoginWithMagicLinkConfiguration) {
    if (
      (SDKEnvironment.sdkName === '@magic-sdk/react-native' ||
        SDKEnvironment.sdkName === '@magic-sdk/react-native-bare' ||
        SDKEnvironment.sdkName === '@magic-sdk/react-native-expo') &&
      isMajorVersionAtLeast(SDKEnvironment.version, 19)
    ) {
      throw new Error(
        'loginWithMagicLink() is deprecated for this package, please utlize a passcode method like loginWithSMS or loginWithEmailOTP instead.',
      );
    }
    const { email, showUI = true, redirectURI } = configuration;

    const requestPayload = this.utils.createJsonRpcRequestPayload(
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
    const { phoneNumber } = configuration;
    const requestPayload = this.utils.createJsonRpcRequestPayload(
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
    const requestPayload = this.utils.createJsonRpcRequestPayload(
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
    let credentialResolved = credentialOrQueryString ?? '';

    if (!credentialOrQueryString) {
      credentialResolved = window.location.search;

      // Remove the query from the redirect callback as a precaution.
      const urlWithoutQuery = window.location.origin + window.location.pathname;
      window.history.replaceState(null, '', urlWithoutQuery);
    }

    const requestPayload = this.utils.createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.LoginWithCredentialTestMode : MagicPayloadMethod.LoginWithCredential,
      [credentialResolved],
    );

    return this.request<string | null>(requestPayload);
  }

  // Custom Auth
  public setAuthorizationToken(jwt: string) {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicPayloadMethod.SetAuthorizationToken, [{ jwt }]);
    return this.request<boolean>(requestPayload);
  }

  public updateEmailWithUI(configuration: UpdateEmailConfiguration) {
    const { email, showUI = true } = configuration;
    const requestPayload = this.utils.createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.UpdateEmailTestMode : MagicPayloadMethod.UpdateEmail,
      [{ email, showUI }],
    );
    return this.request<string | null, UpdateEmailEventHandlers>(requestPayload);
  }

  public updatePhoneNumberWithUI() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.UpdatePhoneNumberTestMode : MagicPayloadMethod.UpdatePhoneNumber,
    );
    return this.request<string | null>(requestPayload);
  }
}

export * from './types';
