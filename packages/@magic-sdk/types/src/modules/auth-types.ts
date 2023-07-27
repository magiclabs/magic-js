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
   * When set to false, developers have the flexibility to implement their own customized UI to
   * handle device check events, providing a more tailored user experience.
   */
  deviceCheckUI?: boolean;
}

export type LoginWithMagicLinkEventsHandler = {
  // Event Received
  'email-sent': () => void;
  'email-not-deliverable': () => void;

  // Event sent
  retry: () => void;
} & DeviceVerificationEventsHandler;

export type LoginWithEmailOTPEventsHandler = {
  // Event Received
  'email-otp-sent': () => void;
  'invalid-email-otp': () => void;

  // Event sent
  'verify-email-otp': (otp: string) => void;
  cancel: () => void;
} & DeviceVerificationEventsHandler;

export type DeviceVerificationEventsHandler = {
  // Event Received
  'device-needs-approval': () => void;
  'device-verification-email-sent': () => void;
  'device-verification-email-not-deliverable': () => void;

  // Event sent
  'reject-device': () => void;
  'approve-device': () => void;
};

export enum LoginWithEmailOTPEventEmit {
  VerifyEmailOtp = 'verify-email-otp',
  Cancel = 'cancel',
}

export enum LoginWithEmailOTPEventOnReceived {
  EmailOTPSent = 'email-otp-sent',
  InvalidEmailOtp = 'invalid-email-otp',
}

export enum DeviceVerificationEventEmit {
  RejectDevice = 'reject-device',
  ApproveDevice = 'approve-device',
}

export enum DeviceVerificationEventOnReceived {
  DeviceNeedsApproval = 'device-needs-approval',
  DeviceVerificationEmailSent = 'device-verification-email-sent',
  DeviceVerificationEmailNotDeliverable = 'device-verification-email-not-deliverable',
}
