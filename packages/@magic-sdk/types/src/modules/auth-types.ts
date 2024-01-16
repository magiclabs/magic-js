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
}

export interface LoginWithSmsConfiguration {
  /**
   * Specify the phone number of the user attempting to login.
   */
  phoneNumber: string;
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

export type LoginWithEmailOTPEventHandlers = {
  // Event Received
  [LoginWithEmailOTPEventOnReceived.EmailOTPSent]: () => void;
  [LoginWithEmailOTPEventOnReceived.InvalidEmailOtp]: () => void;
  [LoginWithEmailOTPEventOnReceived.ExpiredEmailOtp]: () => void;

  // Event sent
  [LoginWithEmailOTPEventEmit.VerifyEmailOtp]: (otp: string) => void;
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
  Cancel = 'cancel',
}

export enum LoginWithEmailOTPEventOnReceived {
  EmailOTPSent = 'email-otp-sent',
  InvalidEmailOtp = 'invalid-email-otp',
  ExpiredEmailOtp = 'expired-email-otp',
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

/**
 * Update Email
 */

type RecencyCheckEventHandlers = {
  [RecencyCheckEventOnReceived.PrimaryAuthFactorNeedsVerification]: () => void;
  [RecencyCheckEventOnReceived.PrimaryAuthFactorVerified]: () => void;
  [RecencyCheckEventOnReceived.PrimaryAuthFactorVerificationEmailExpired]: () => void;
  [RecencyCheckEventOnReceived.PrimaryAuthFactorVerificationEmailSent]: () => void;

  [RecencyCheckEventEmit.Cancel]: () => void;
  [RecencyCheckEventEmit.Retry]: () => void;
}

export type UpdateEmailEventHandlers = {
  [UpdateEmailEventOnReceived.NewAuthFactorNeedsVerification]: () => void;
  [UpdateEmailEventOnReceived.NewAuthFactorVerified]: () => void;
  [UpdateEmailEventOnReceived.NewAuthFactorVerificationEmailExpired]: () => void;
  [UpdateEmailEventOnReceived.NewAuthFactorVerificationEmailSent]: () => void;

  [UpdateEmailEventEmit.Cancel]: () => void;
  [UpdateEmailEventEmit.NewEmailRetry]: () => void;
} & RecencyCheckEventHandlers

export enum RecencyCheckEventEmit {
  Retry = 'auth-factor-retry',
  Cancel = 'auth-factor-verification-cancel'
}

export enum RecencyCheckEventOnReceived {
  PrimaryAuthFactorNeedsVerification = 'auth-factor-needs-verification',
  PrimaryAuthFactorVerified = 'auth-factor-verified',
  PrimaryAuthFactorVerificationEmailExpired = 'auth-factor-verification-email-expired',
  PrimaryAuthFactorVerificationEmailSent = 'auth-factor-verification-email-sent',
}

export enum UpdateEmailEventEmit {
  NewEmailRetry = 'new-email-verification-retry',
  Cancel = 'new-email-verification-cancel'
}

export enum UpdateEmailEventOnReceived {
  NewAuthFactorNeedsVerification = 'auth-factor-needs-verification',
  NewAuthFactorVerified = 'auth-factor-verified',
  NewAuthFactorVerificationEmailExpired = 'auth-factor-verification-email-expired',
  NewAuthFactorVerificationEmailSent = 'auth-factor-verification-email-sent',
}
