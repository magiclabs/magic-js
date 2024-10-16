import { MagicUserMetadata } from '@magic-sdk/types';

export enum OAuthPayloadMethods {
  Start = 'magic_oauth_login_with_redirect_start',
  Verify = 'magic_oauth_login_with_redirect_verify',
  StartPopup = 'magic_oauth_login_with_popup_start',
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
  | 'microsoft';

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
  loginHint?: string;
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

export interface OAuthPopupConfiguration {
  provider: OAuthProvider;
}

export interface OAuthPopupResult {
  verifyData: OAuthVerifyResponse;
  requestOriginMessage: string;
}

export type OAuthVerifyResponse = {
  authUserId: string;
  authUserSessionToken: string;
  oauthAccessToken: string;
  refreshToken?: string;
  factorsRequired?: MfaFactors;
  loginFlowContext?: string;
  userInfo: OpenIDConnectUserInfo;
};

export type MfaFactors = Array<{
  type: Array<'email_link' | 'totp' | 'recovery_codes' | 'public_address' | 'sms'>;
  isVerified: boolean;
}>;
