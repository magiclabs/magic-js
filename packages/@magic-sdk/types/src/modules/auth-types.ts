import { WalletEventOnReceived } from './wallet-types';

export interface LoginWithMagicLinkConfiguration {
  /**
   * The email address of the user attempting to login.
   */
  email: string;

  /**
   * When `true`, a pre-built modal interface will show to the user, directing
   * them to check their email for the "magic link" to complete their
   * authentication.
   */
  showUI?: boolean;

  /**
   * You can optionally provide a redirect URI that will be followed at the end
   * of the magic link flow. Don't forget to invoke
   * `magic.auth.loginWithCredential()` to complete the login from the route you
   * configure here.
   */
  redirectURI?: string;

  /**
   * Enterprise users with a custom SMTP can create custom email templates
   * from their dashboard. The default Magic loginWithMagicLink email will be
   * overriden when a variation is passed here.
   */
  overrides?: {
    variation?: string;
  };

  /**
   * The number of seconds until the generated Decenteralized ID token will expire.
   */
  lifespan?: number;
}

export interface LoginWithSmsConfiguration {
  /**
   * Specify the phone number of the user attempting to login.
   */
  phoneNumber: string;

  /**
   * When `true`, a pre-built modal interface will show to the user, directing
   * them to check their SMS for the one time passcode (OTP) to complete their
   * authentication.
   *
   * When `false`, developers will be able to implement their own custom UI to
   * continue the SMS OTP flow.
   */
  showUI?: boolean;

  /*
   * The number of seconds until the generated Decenteralized ID token will expire.
   */
  lifespan?: number;
}
export interface LoginWithEmailOTPConfiguration {
  /**
   * Specify the email address of the user attempting to login.
   */
  email: string;

  /**
   * When `true`, a pre-built modal interface will show to the user, directing
   * them to check their email for the one time passcode (OTP) to complete their
   * authentication.
   *
   * When `false`, developers will be able to implement their own custom UI to
   * continue the email OTP flow.
   */
  showUI?: boolean;

  /**
   * Device Unrecognized UI will enforce showing up to secure user's login
   *
   * When set to true (default), an improved device recognition UI will be displayed to the user,
   * prompting them to verify their login by checking their email for device approval. This feature
   * enhances authentication security.
   *
   * This param will only be affect if showUI is false. When set to false,
   * developers have the flexibility to implement their own customized UI to
   * handle device check events, providing a more tailored user experience.
   */
  deviceCheckUI?: boolean;

  /**
   * Enterprise users with a custom SMTP can create custom email templates
   * from their dashboard. The default Magic loginWithOTP email will be
   * overriden when a variation is passed here.
   */
  overrides?: {
    variation?: string;
  };

  /**
   * The number of seconds until the generated Decenteralized ID token will expire.
   */
  lifespan?: number;
}

export interface LoginWithCredentialConfiguration {
  /**
   * A credential token or a valid query string (prefixed with ? or #)
   */
  credentialOrQueryString?: string;

  /**
   * The number of seconds until the generated Decenteralized ID token will expire.
   */
  lifespan?: number;
}

/**
 * Auth Events Enum
 */
export enum LoginWithMagicLinkEventEmit {
  Retry = 'retry',
}

export enum LoginWithMagicLinkEventOnReceived {
  EmailSent = 'email-sent',
  EmailNotDeliverable = 'email-not-deliverable',
}

export enum LoginWithEmailOTPEventEmit {
  VerifyEmailOtp = 'verify-email-otp',
  VerifyMFACode = 'verify-mfa-code',
  Cancel = 'cancel',
}

export enum LoginWithSmsOTPEventEmit {
  VerifySmsOtp = 'verify-sms-otp',
  Cancel = 'cancel',
  Retry = 'retry',
}

export enum LoginWithSmsOTPEventOnReceived {
  SmsOTPSent = 'sms-otp-sent',
  InvalidSmsOtp = 'invalid-sms-otp',
  ExpiredSmsOtp = 'expired-sms-otp',
}

export enum LoginWithEmailOTPEventOnReceived {
  EmailOTPSent = 'email-otp-sent',
  InvalidEmailOtp = 'invalid-email-otp',
  InvalidMfaOtp = 'invalid-mfa-otp',
  ExpiredEmailOtp = 'expired-email-otp',
  MfaSentHandle = 'mfa-sent-handle',
}

export enum DeviceVerificationEventEmit {
  Retry = 'device-retry',
}

export enum DeviceVerificationEventOnReceived {
  DeviceApproved = 'device-approved',
  DeviceNeedsApproval = 'device-needs-approval',
  DeviceVerificationLinkExpired = 'device-verification-link-expired',
  DeviceVerificationEmailSent = 'device-verification-email-sent',
}

export enum RecencyCheckEventEmit {
  Retry = 'Recency/auth-factor-retry',
  Cancel = 'Recency/auth-factor-verification-cancel',
  VerifyEmailOtp = 'Recency/auth-factor-verify-email-otp',
  VerifyMFACode = 'Recency/verify-mfa-code',
}

export enum RecencyCheckEventOnReceived {
  PrimaryAuthFactorNeedsVerification = 'Recency/auth-factor-needs-verification',
  PrimaryAuthFactorVerified = 'Recency/auth-factor-verified',
  InvalidEmailOtp = 'Recency/auth-factor-invalid-email-otp',
  EmailExpired = 'Recency/auth-factor-verification-email-expired',
  EmailSent = 'Recency/auth-factor-verification-email-sent',
  EmailNotDeliverable = 'Recency/auth-factor-verification-email-not-deliverable',
}

export enum UpdateEmailEventEmit {
  RetryWithNewEmail = 'UpdateEmail/retry-with-new-email',
  Cancel = 'UpdateEmail/new-email-verification-cancel',
  VerifyEmailOtp = 'UpdateEmail/new-email-verify-otp',
}

export enum UpdateEmailEventOnReceived {
  NewAuthFactorNeedsVerification = 'UpdateEmail/new-email-needs-verification',
  EmailUpdated = 'UpdateEmail/email-updated',
  InvalidEmailOtp = 'UpdateEmail/new-email-invalid-email-otp',
  EmailExpired = 'UpdateEmail/new-email-verification-email-expired',
  EmailSent = 'UpdateEmail/new-email-verification-email-sent',
  EmailNotDeliverable = 'UpdateEmail/new-email-verification-email-not-deliverable',
  InvalidEmail = 'UpdateEmail/new-email-invalid',
  EmailAlreadyExists = 'UpdateEmail/new-email-already-exists',
}

export enum AuthEventOnReceived {
  IDTokenCreated = 'Auth/id-token-created',
}

export enum FarcasterLoginEventEmit {
  SuccessSignIn = 'Farcaster/success_sign_in',
}

/**
 * EventHandlers
 */
export type LoginWithMagicLinkEventHandlers = {
  // Event Received
  [LoginWithMagicLinkEventOnReceived.EmailSent]: () => void;
  [LoginWithMagicLinkEventOnReceived.EmailNotDeliverable]: () => void;

  // Event sent
  [LoginWithMagicLinkEventEmit.Retry]: () => void;
} & DeviceVerificationEventHandlers;

export type LoginWithSmsOTPEventHandlers = {
  // Event sent
  [LoginWithSmsOTPEventEmit.VerifySmsOtp]: (otp: string) => void;
  [LoginWithSmsOTPEventEmit.Cancel]: () => void;
  [LoginWithSmsOTPEventEmit.Retry]: () => void;

  // Event received
  [LoginWithSmsOTPEventOnReceived.SmsOTPSent]: () => void;
  [LoginWithSmsOTPEventOnReceived.InvalidSmsOtp]: () => void;
  [LoginWithSmsOTPEventOnReceived.ExpiredSmsOtp]: () => void;
} & DeviceVerificationEventHandlers;

export type LoginWithEmailOTPEventHandlers = {
  // Event Received
  [LoginWithEmailOTPEventOnReceived.EmailOTPSent]: () => void;
  [LoginWithEmailOTPEventOnReceived.InvalidEmailOtp]: () => void;
  [LoginWithEmailOTPEventOnReceived.InvalidMfaOtp]: () => void;
  [LoginWithEmailOTPEventOnReceived.ExpiredEmailOtp]: () => void;
  [LoginWithEmailOTPEventOnReceived.MfaSentHandle]: () => void;
  [AuthEventOnReceived.IDTokenCreated]: (idToken: string) => void;
  [WalletEventOnReceived.WalletInfoFetched]: () => void;

  // Event sent
  [LoginWithEmailOTPEventEmit.VerifyEmailOtp]: (otp: string) => void;
  [LoginWithEmailOTPEventEmit.VerifyMFACode]: (mfa: string) => void;
  [LoginWithEmailOTPEventEmit.Cancel]: () => void;
} & DeviceVerificationEventHandlers;

type DeviceVerificationEventHandlers = {
  // Event Received
  [DeviceVerificationEventOnReceived.DeviceNeedsApproval]: () => void;
  [DeviceVerificationEventOnReceived.DeviceVerificationEmailSent]: () => void;
  [DeviceVerificationEventOnReceived.DeviceVerificationLinkExpired]: () => void;
  [DeviceVerificationEventOnReceived.DeviceApproved]: () => void;

  // Event sent
  [DeviceVerificationEventEmit.Retry]: () => void;
};

/**
 * Update Email
 */

type RecencyCheckEventHandlers = {
  [RecencyCheckEventOnReceived.PrimaryAuthFactorNeedsVerification]: () => void;
  [RecencyCheckEventOnReceived.PrimaryAuthFactorVerified]: () => void;
  [RecencyCheckEventOnReceived.InvalidEmailOtp]: () => void;
  [RecencyCheckEventOnReceived.EmailNotDeliverable]: () => void;
  [RecencyCheckEventOnReceived.EmailExpired]: () => void;
  [RecencyCheckEventOnReceived.EmailSent]: () => void;

  [RecencyCheckEventEmit.Cancel]: () => void;
  [RecencyCheckEventEmit.Retry]: () => void;
  [RecencyCheckEventEmit.VerifyEmailOtp]: (otp: string) => void;
  [RecencyCheckEventEmit.VerifyMFACode]: (mfa: string) => void;
};

export type UpdateEmailEventHandlers = {
  [UpdateEmailEventOnReceived.NewAuthFactorNeedsVerification]: () => void;
  [UpdateEmailEventOnReceived.EmailUpdated]: () => void;
  [UpdateEmailEventOnReceived.InvalidEmailOtp]: () => void;
  [UpdateEmailEventOnReceived.EmailNotDeliverable]: () => void;
  [UpdateEmailEventOnReceived.EmailExpired]: () => void;
  [UpdateEmailEventOnReceived.EmailSent]: () => void;
  [UpdateEmailEventOnReceived.InvalidEmail]: () => void;
  [UpdateEmailEventOnReceived.EmailAlreadyExists]: () => void;

  [UpdateEmailEventEmit.Cancel]: () => void;
  [UpdateEmailEventEmit.RetryWithNewEmail]: (email?: string) => void;
  [UpdateEmailEventEmit.VerifyEmailOtp]: (otp: string) => void;
} & RecencyCheckEventHandlers;
