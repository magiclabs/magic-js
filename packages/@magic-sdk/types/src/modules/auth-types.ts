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

  /**
   * When `true`, a pre-built modal interface will show to the user, directing
   * them to check their email for the one time passcode (OTP) to complete their
   * authentication.
   *
   * When `false`, developers will be able to implement their own custom UI to
   * continue the email OTP flow.
   */
  showUI?: boolean;
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
}

export type LoginWithMagicLinkEvents = {
  'email-sent': () => void;
  'email-not-deliverable': () => void;
  retry: () => void;
};

export type LoginWithEmailOTPEvents = {
  'send-email-otp': (email: string) => void;
  'verify-email-otp': (otp: string) => void;
  'email-not-deliverable': () => void;
  'invalid-email-format': () => void;
  'invalid-email-otp': () => void;
  'lockout-too-many-failed-attempts': () => void;
};

export type LoginWithSMSEvents = {
  'send-sms-otp': (phoneNumber: string) => void;
  'verify-sms-otp': (otp: string) => void;
  'sms-not-deliverable': () => void;
  'invalid-sms-otp': () => void;
  'too-many-sms-send-requests': () => void;
  'cancel-flow': () => void;
  'empired-sms-otp': () => void;
};
