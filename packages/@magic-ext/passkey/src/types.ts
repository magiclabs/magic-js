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

export interface AddPasskeyConfiguration {
  /**
   * The username of the user adding the passkey.
   * Optional parameter used as display name for the passkey.
   */
  username?: string;

  /**
   * The nickname that the user attempts to set to this passkey.
   */
  nickname?: string;
}

export interface UpdatePasskeyConfiguration {
  /**
   * The passkey ID of the passkey to update.
   */
  passkeyId: string;

  /**
   * The new nickname for the passkey.
   */
  nickname: string;
}

export interface RemovePasskeyConfiguration {
  /**
   * The passkey ID of the passkey to remove.
   */
  passkeyId: string;
}

export enum MagicPasskeyPayloadMethod {
  RegisterPasskeyStart = 'magic_auth_register_passkey_start',
  RegisterPasskeyVerify = 'magic_auth_register_passkey_verify',
  LoginWithPasskeyStart = 'magic_auth_login_with_passkey_start',
  LoginWithPasskeyVerify = 'magic_auth_login_with_passkey_verify',
  GetPasskeyInfo = 'magic_user_get_webauthn_credentials',
  AddPasskeyStart = 'magic_auth_add_passkey_start',
  AddPasskeyVerify = 'magic_auth_add_passkey_verify',
  UpdatePasskey = 'magic_auth_update_passkey',
  RemovePasskey = 'magic_auth_remove_passkey',
  EnablePasskeyMfaStart = 'magic_auth_enable_passkey_mfa_flow_start',
  EnablePasskeyMfaVerify = 'magic_auth_enable_passkey_mfa_flow_verify',
  DisablePasskeyMfaStart = 'magic_auth_disable_passkey_mfa_flow_start',
  DisablePasskeyMfaVerify = 'magic_auth_disable_passkey_mfa_flow_verify',
}

export enum PasskeySDKErrorCode {
  PasskeyNotSupported = 'PASSKEY_NOT_SUPPORTED',
  PasskeyRegisterError = 'PASSKEY_REGISTRATION_ERROR',
  PasskeyUserCancelledOrTimeout = 'PASSKEY_USER_CANCELLED_OR_TIMEOUT',
}
