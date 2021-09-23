export interface RegisterNewUserConfiguration {
  /**
   * The username of the user attempting to register.
   */
  username: string;

  /**
   * The nickname that the user attempts to set to this webauthn device.
   */
  nickname?: string;
}

export interface LoginWithWebAuthnConfiguration {
  /**
   * The username of the user attempting to register.
   */
  username: string;
}

export interface UpdateWebAuthnInfoConfiguration {
  /**
   *  WebAuthn info id
   */
  id: string;

  /**
   *  nickname that user attempts to update to the webauth device associate to the id.
   */
  nickname: string;
}

export enum MagicWebAuthnPayloadMethod {
  WebAuthnRegistrationStart = 'magic_auth_webauthn_registration_start',
  RegisterWithWebAuth = 'magic_auth_webauthn_register',
  LoginWithWebAuthn = 'magic_auth_login_with_web_authn',
  WebAuthnLoginVerify = 'magic_auth_login_with_webauthn_verify',
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
