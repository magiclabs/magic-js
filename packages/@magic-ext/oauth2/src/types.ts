import { MagicUserMetadata } from '@magic-sdk/types';

export enum OAuthPayloadMethods {
  Start = 'magic_oauth_login_with_redirect_start',
  Verify = 'magic_oauth_login_with_redirect_verify',
  Popup = 'magic_oauth_login_with_popup',
  VerifyTelegramData = 'magic_oauth_verify_telegram_data',
  VerifySteamData = 'magic_oauth_verify_steam_data',
}

export type OAuthProvider =
  | 'google'
  | 'facebook'
  | 'apple'
  | 'github'
  | 'bitbucket'
  | 'gitlab'
  | 'linkedin'
  | 'twitter'
  | 'discord'
  | 'twitch'
  | 'microsoft'
  | 'steam';

type OAuthPopupProvider = OAuthProvider | 'telegram';

export interface OAuthErrorData {
  provider: OAuthProvider;
  errorURI?: string;
}

export interface OpenIDConnectProfile {
  name?: string;
  familyName?: string;
  givenName?: string;
  middleName?: string;
  nickname?: string;
  preferredUsername?: string;
  profile?: string;
  picture?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  updatedAt?: number;
}

export interface OpenIDConnectEmail {
  email?: string;
  emailVerified?: boolean;
}

export interface OpenIDConnectPhone {
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
}

export interface OpenIDConnectAddress {
  address?: {
    formatted?: string;
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
}

export type OpenIDConnectUserInfo = OpenIDConnectProfile &
  OpenIDConnectEmail &
  OpenIDConnectPhone &
  OpenIDConnectAddress & { sub?: string; sources?: Record<string, any> } & Record<string, any>;

export interface OAuthRedirectStartResult {
  oauthAuthoriationURI?: string;
  useMagicServerCallback?: boolean;
  shouldReturnURI?: boolean;
  /**
   * Present in the new client-PKCE path. The extension stores this alongside
   * codeVerifier at the SDK level and forwards it in the verify call.
   */
  pkceMetadata?: {
    state: string;
    redirectUri: string;
    appID: string;
    provider: string;
  };
}

export interface OAuthRedirectResult {
  oauth: {
    provider: OAuthProvider;
    scope: string[];
    userHandle: string;
    userInfo: OpenIDConnectUserInfo;
  };
  magic: {
    idToken: string;
    userMetadata: MagicUserMetadata;
  };
}

export interface OAuthRedirectError {
  provider: OAuthProvider;
  error: string;
  error_description?: string;
  error_uri?: string;
}

export interface OAuthRedirectConfiguration {
  provider: OAuthProvider;
  redirectURI: string;
  scope?: string[];
  customData?: string;
  providerParams?: Record<string, string | number | boolean>;
  loginHint?: string;
}

export interface OAuthVerificationConfiguration {
  lifespan?: number;
  optionalQueryString?: string;
  skipDIDToken?: boolean;
  showMfaModal?: boolean;
}

export interface OAuthPopupConfiguration {
  provider: OAuthPopupProvider;
  scope?: string[];
  loginHint?: string;
  providerParams?: Record<string, string | number | boolean>;
  shouldReturnURI?: boolean;
  showMfaModal?: boolean;
}

export enum OAuthErrorCode {
  InvalidRequest = 'invalid_request',
  InvalidClient = 'invalid_client',
  InvalidScope = 'invalid_scope',
  InvalidGrant = 'invalid_grant',
  UnauthorizedClient = 'unauthorized_client',
  UnsupportedResponseType = 'unsupported_response_type',
  UnsupportedGrantType = 'unsupported_grant_type',
  UnsupportedTokenType = 'unsupported_token_type',
  AccessDenied = 'access_denied',
  ServerError = 'server_error',
  TemporarilyUnavailable = 'temporarily_unavailable',
}
