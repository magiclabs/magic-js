export interface GetIdTokenConfiguration {
  /**
   * The number of seconds until the generated ID token will expire.
   */
  lifespan?: number;
}

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

export interface PhantomModeUserMetadata {
  publicAddress: string | null;
  email: string | null;
}
