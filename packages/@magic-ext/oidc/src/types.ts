export interface LoginWithOpenIdParams {
  jwt: string;
  providerId: string;
  lifespan?: number;
}

export enum MagicOpenIdConnectPayloadMethod {
  LoginWithOIDC = 'magic_auth_login_with_oidc',
}
