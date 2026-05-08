export interface GoogleOneTapConfig {
  /**
   * The Google Cloud OAuth 2.0 client ID. Must have the dapp's domain registered
   * under "Authorized JavaScript origins" in the Google Cloud Console.
   */
  googleClientId: string;

  /**
   * The Magic `FederatedIdentityProvider` ID configured for Google as the OIDC
   * issuer. The Google ID token returned by One Tap is forwarded to Magic and
   * verified against this provider.
   */
  magicProviderId: string;

  /**
   * If true, returning users with a single eligible Google account skip the click
   * and are signed in automatically. Defaults to `false`.
   */
  autoSelect?: boolean;

  /**
   * If true, the prompt is dismissed when the user taps outside it.
   * Defaults to GSI's default behavior (`true`).
   */
  cancelOnTapOutside?: boolean;

  /**
   * If true (default), let GSI use the FedCM browser API where available.
   * Modern Chrome relies on this for the One Tap UX to surface at all.
   */
  useFedCM?: boolean;

  /**
   * Optional DOM element id that GSI should anchor the prompt to. If omitted,
   * GSI uses its default top-right placement.
   */
  promptParentId?: string;

  /**
   * Optional lifespan (in seconds) for the resulting Magic DID token.
   */
  lifespan?: number;
}

/**
 * Reuses `magic_auth_login_with_oidc` and disambiguates via `walletIdentityScope: 'magic'`
 * in the payload, which tells the iframe handler to mint a Magic-shaped fridge token
 * (wallet keyed on auth_user) instead of the federated default (wallet keyed on issuer/
 * subject/audience). The default keeps existing OIDC customers' wallets intact; One Tap
 * is greenfield, so it gets the Magic-keyed shape.
 */
export enum GoogleOneTapPayloadMethod {
  LoginWithOIDC = 'magic_auth_login_with_oidc',
}

export interface LoginWithOIDCParams {
  jwt: string;
  providerId: string;
  lifespan?: number;
  walletIdentityScope?: 'federated' | 'magic';
}
