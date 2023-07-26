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
  walletType: 'magic' | 'metamask' | 'coinbase_wallet';
}

export interface RequestUserInfoScope {
  scope?: {
    email?: 'required' | 'optional';
  };
}

export interface NFTPurchaseRequest {
  nft: {
    name: string;
    imageUrl: string;
    blockchainNftId: string;
    contractAddress: string;
    network: string;
    platform: string;
    type: string;
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

export interface NFTCheckoutRequest {
  // given by magic / found in the developer dashboard in future
  contractId: string;
  contractAddress: string;
  // in contract, if ERC1155… for ERC721, use token ID = 0
  tokenId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  // Checkout UI compares against session wallet, if == then show “Magic Wallet”
  walletAddress?: string;
}

export type NFTCheckoutStatus = 'processed' | 'declined' | 'expired';

export interface NFTCheckoutResponse {
  status: NFTCheckoutStatus;
  viewInWallet?: boolean;
}

export enum Wallets {
  MetaMask = 'metamask',
  CoinbaseWallet = 'coinbase_wallet',
}

export enum Events {
  WalletSelected = 'wallet_selected',
  WalletConnected = 'wallet_connected',
  WalletRejected = 'wallet_rejected',
}

export interface UserEnv {
  env: {
    isMetaMaskInstalled: boolean;
    isCoinbaseWalletInstalled: boolean;
  };
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
  SetAuthorizationToken = 'magic_auth_set_authorization_token',
  GetIdToken = 'magic_auth_get_id_token',
  GenerateIdToken = 'magic_auth_generate_id_token',
  GetMetadata = 'magic_auth_get_metadata',
  IsLoggedIn = 'magic_is_logged_in',
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
  GetInfo = 'magic_get_info',
  ShowUI = 'magic_wallet',
  NFTPurchase = 'magic_nft_purchase',
  NFTCheckout = 'magic_nft_checkout',
  RequestUserInfoWithUI = 'mc_request_user_info',
  Disconnect = 'mc_disconnect',
  UpdatePhoneNumber = 'magic_auth_update_phone_number',
  UpdatePhoneNumberTestMode = 'magic_auth_update_phone_number_testing_mode',
  RecoverAccount = 'magic_auth_recover_account',
  RecoverAccountTestMode = 'magic_auth_recover_account_testing_mode',
  MagicBoxHeartBeat = 'magic_box_heart_beat',
  AutoConnect = 'mc_auto_connect',
  Login = 'mc_login',
  EncryptV1 = 'magic_auth_encrypt_v1',
  DecryptV1 = 'magic_auth_decrypt_v1',
  ShowNFTs = 'magic_show_nfts',
  ShowOnRamp = 'magic_show_fiat_onramp',
  ShowSendTokensUI = 'magic_show_send_tokens_ui',
  ShowAddress = 'magic_show_address',
  ShowBalances = 'magic_show_balances',
}
