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
}

export interface RegisterWithWebAuthnConfiguration {
  /**
   * The username of the user attempting to register.
   */
  username: string;

  /**
   * The nickname that the user attempts to set to this webauthn device.
   */
  nickname?: string;
}

export interface LoginWithWebAuthnConfiguration {
  /**
   * The username of the user attempting to register.
   */
  username: string;
}
