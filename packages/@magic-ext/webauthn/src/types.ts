export interface RegisterNewUserConfiguration {
  /**
   * The username of the user attempting to register.
   * Optional parameter used as display name for the passkey
   */
  username?: string;

  /**
   * The nickname that the user attempts to set to this webauthn device.
   */
  nickname?: string;

  skipDIDToken?: boolean;
  lifespan?: number;
}

export interface LoginWithWebAuthnConfiguration {
  /**
   * The username of the user attempting to login.
   * Optional parameter used for legacy users
   */
  username?: string;

  showMfaModal?: boolean;
  skipDIDToken?: boolean;
  lifespan?: number;
}

export interface UpdateWebAuthnInfoConfiguration {
  /**
   *  WebAuthn info id
   */
  id: string;

  /**
   *  nickname that user attempts to update to the webauthn device associate to the id.
   */
  nickname: string;
}

export enum MagicWebAuthnPayloadMethod {
  RegisterPasskeyStart = 'magic_auth_register_passkey_start',
  RegisterPasskeyVerify = 'magic_auth_register_passkey_verify',
  LoginWithPasskeyStart = 'magic_auth_login_with_passkey_start',
  LoginWithPasskeyVerify = 'magic_auth_login_with_passkey_verify',
  GetWebAuthnInfo = 'magic_user_get_webauthn_credentials',
  UpdateWebAuthnInfo = 'magic_user_update_webauthn',
  UnregisterWebAuthDevice = 'magic_user_unregister_webauthn',
  RegisterWebAuthDeviceStart = 'magic_auth_register_webauthn_device_start',
  RegisterWebAuthDevice = 'magic_auth_register_webauthn_device',
}

export enum WebAuthnSDKErrorCode {
  WebAuthnNotSupported = 'WEBAUTHN_NOT_SUPPORTED',
  WebAuthnCreateCredentialError = 'WEBAUTHN_CREATE_CREDENTIAL_ERROR',
}
