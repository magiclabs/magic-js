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
