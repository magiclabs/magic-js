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
  data?: any;
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
  scope?: {
    email?: 'required' | 'optional';
  };
}

export enum Wallets {
  MetaMask = 'metamask',
  WalletConnect = 'wallet_connect',
  CoinbaseWallet = 'coinbase_wallet',
}

export enum Events {
  WalletSelected = 'wallet_selected',
  WalletConnected = 'wallet_connected',
  WalletRejected = 'wallet_rejected',
  DisplayUri = 'display_uri',
  Uri = 'uri',
}

export enum Errors {
  WalletConnectError = 'Missing Wallet Connect Config',
  CoinbaseWalletError = 'Missing Coinbase Wallet Config',
}

export interface UserEnv {
  env: {
    isMetaMaskInstalled: boolean;
    isCoinbaseWalletInstalled: boolean;
  };
}

export interface NFTPurchaseRequest {
  nft: {
    name: string;
    price: number;
    currencyCode: string;
    contractAddress: string;
    collection?: string;
    imageUrl?: string;
  };
  identityPrefill: {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    emailAddress: string;
    phone: string;
    address: {
      street1: string;
      street2: string;
      city: string;
      regionCode: string;
      postalCode: string;
      countryCode: string;
    };
  };
}

export type NFTPurchaseStatus = 'processed' | 'declined' | 'expired';

export interface NFTPurchaseResponse {
  status: NFTPurchaseStatus;
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
  AutoConnect = 'mc_auto_connect',
  Login = 'mc_login',
  RequestAccounts = 'eth_requestAccounts',
  GetInfo = 'mc_get_wallet_info',
  ShowUI = 'mc_wallet',
  NFTPurchase = 'magic_nft_purchase',
  RequestUserInfoWithUI = 'mc_request_user_info',
  Disconnect = 'mc_disconnect',
  UpdatePhoneNumber = 'magic_auth_update_phone_number',
  UpdatePhoneNumberTestMode = 'magic_auth_update_phone_number_testing_mode',
  RecoverAccount = 'magic_auth_recover_account',
  RecoverAccountTestMode = 'magic_auth_recover_account_testing_mode',
}
