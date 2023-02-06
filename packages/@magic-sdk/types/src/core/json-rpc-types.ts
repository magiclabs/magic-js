import { RPCErrorCode } from './exception-types';

// --- Request interfaces

export interface JsonRpcRequestPayload<TParams = any> {
  jsonrpc: string;
  id: string | number | null;
  method: string;
  params?: TParams;
}

export interface JsonRpcRequestCallback {
  /** Callback executed upon JSON RPC response. */
  (err: JsonRpcError | null, result?: JsonRpcResponsePayload | null): void;
}

export interface JsonRpcBatchRequestCallback {
  /** Callback executed upon JSON RPC response. */
  (err: JsonRpcError | null, result?: (JsonRpcResponsePayload | null)[] | null): void;
}

// --- Response interfaces

export interface JsonRpcError {
  message: string;
  code: RPCErrorCode;
}

export interface JsonRpcResponsePayload<ResultType = any> {
  jsonrpc: string;
  id: string | number | null;
  result?: ResultType | null;
  error?: JsonRpcError | null;
}

export interface UserInfo {
  email?: string;
}

export interface WalletInfo {
  walletType: 'magic' | 'metamask' | 'coinbase_wallet' | 'wallet_connect';
}

export interface RequestUserInfoScope {
  email?: 'required' | 'optional';
}

// --- Payload methods

/**
 * Enum of JSON RPC methods for interacting with the Magic SDK authentication
 * relayer.
 */
export enum MagicPayloadMethod {
  LoginWithSms = 'magic_auth_login_with_sms',
  LoginWithEmailOTP = 'magic_auth_login_with_email_otp',
  LoginWithMagicLink = 'magic_auth_login_with_magic_link',
  LoginWithCredential = 'magic_auth_login_with_credential',
  GetIdToken = 'magic_auth_get_id_token',
  GenerateIdToken = 'magic_auth_generate_id_token',
  GetMetadata = 'magic_auth_get_metadata',
  IsLoggedIn = 'magic_auth_is_logged_in',
  Logout = 'magic_auth_logout',
  UpdateEmail = 'magic_auth_update_email',
  UserSettings = 'magic_auth_settings',
  UserSettingsTestMode = 'magic_auth_settings_testing_mode',
  LoginWithSmsTestMode = 'magic_auth_login_with_sms_testing_mode',
  LoginWithEmailOTPTestMode = 'magic_auth_login_with_email_otp_testing_mode',
  LoginWithMagicLinkTestMode = 'magic_login_with_magic_link_testing_mode',
  LoginWithCredentialTestMode = 'magic_auth_login_with_credential_testing_mode',
  GetIdTokenTestMode = 'magic_auth_get_id_token_testing_mode',
  GenerateIdTokenTestMode = 'magic_auth_generate_id_token_testing_mode',
  GetMetadataTestMode = 'magic_auth_get_metadata_testing_mode',
  IsLoggedInTestMode = 'magic_auth_is_logged_in_testing_mode',
  LogoutTestMode = 'magic_auth_logout_testing_mode',
  UpdateEmailTestMode = 'magic_auth_update_email_testing_mode',
  IntermediaryEvent = 'magic_intermediary_event',
  RequestAccounts = 'eth_requestAccounts',
  GetInfo = 'mc_get_wallet_info',
  ShowUI = 'mc_wallet',
  RequestUserInfoWithUI = 'mc_request_user_info',
  Disconnect = 'mc_disconnect',
}
