export interface GetIdTokenConfiguration {
  /**
   * The number of seconds until the generated ID token will expire.
   */
  lifespan?: number;
}

export interface GenerateIdTokenConfiguration extends GetIdTokenConfiguration {
  /**
   * An optional piece of data to sign with the token. Note, however, that the
   * unsigned data _will not_ be encoded in the token, only an encrypted
   * signature of the data.
   */
  attachment?: string;
}

export interface MagicUserMetadata {
  issuer: string | null;
  publicAddress: string | null;
  email: string | null;
}
