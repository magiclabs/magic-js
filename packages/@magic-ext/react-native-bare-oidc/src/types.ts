export interface LoginWithOpenIdParams {
  jwt: string;
  providerId: string;
}

export enum MagicOpenIdConnectPayloadMethod {
  LoginWithOIDC = 'magic_auth_login_with_oidc',
}
