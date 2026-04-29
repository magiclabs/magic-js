export interface RegisterNewUserConfiguration {
  /**
   * The username of the user attempting to register.
   * Optional parameter used as display name for the passkey
   */
  username?: string;

  /**
   * The nickname that the user attempts to set to this passkey.
   */
  nickname?: string;

  skipDIDToken?: boolean;
  lifespan?: number;
}

export interface LoginWithPasskeyConfiguration {
  /**
   * The username of the user attempting to login.
   * Optional parameter used for legacy users
   */
  username?: string;

  showMfaModal?: boolean;
  skipDIDToken?: boolean;
  lifespan?: number;
}

export enum MagicPasskeyPayloadMethod {
  RegisterPasskeyStart = 'magic_auth_register_passkey_start',
  RegisterPasskeyVerify = 'magic_auth_register_passkey_verify',
  LoginWithPasskeyStart = 'magic_auth_login_with_passkey_start',
  LoginWithPasskeyVerify = 'magic_auth_login_with_passkey_verify',
  GetPasskeyInfo = 'magic_user_get_webauthn_credentials',
}

export enum PasskeySDKErrorCode {
  PasskeyNotSupported = 'PASSKEY_NOT_SUPPORTED',
  PasskeyRegisterError = 'PASSKEY_REGISTRATION_ERROR',
}
