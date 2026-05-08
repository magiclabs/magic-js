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
 * Dedicated RPC for the Google One Tap flow. Distinct from `magic_auth_login_with_oidc`:
 * the One Tap path mints a Magic-shaped fridge access token (no `x-oidc-provider-id`
 * header sent on subsequent TEE calls), which keeps it isolated from the legacy OIDC
 * flow's wallet-identity scoping.
 */
export enum GoogleOneTapPayloadMethod {
  LoginWithGoogleOneTap = 'magic_auth_login_with_google_one_tap',
}

export interface LoginWithGoogleOneTapParams {
  jwt: string;
  providerId: string;
  lifespan?: number;
}
