// Widget view state machine

import { LoginProvider, OAuthProvider, ThirdPartyWallet, ThirdPartyWallets } from './types';

export type View =
  | 'login'
  | 'otp'
  | 'sms_login'
  | 'additional_providers'
  | 'wallet_pending'
  | 'walletconnect_pending'
  | 'oauth_pending'
  | 'otp_pending'
  | 'device_verification'
  | 'mfa_pending'
  | 'recovery_code'
  | 'lost_recovery_code'
  | 'login_success'
  | 'passkey_options'
  | 'passkey_pending'
  | 'farcaster_pending'
  | 'farcaster_success'
  | 'farcaster_failed';

export type OtpLoginStatus =
  | 'idle'
  | 'sending'
  | 'otp_sent'
  | 'verifying_otp'
  | 'invalid_otp'
  | 'expired_otp'
  | 'max_attempts_reached'
  | 'device_needs_approval'
  | 'device_verification_sent'
  | 'device_verification_expired'
  | 'device_approved'
  | 'mfa_required'
  | 'recovery_code'
  | 'success'
  | 'mfa_verifying'
  | 'mfa_invalid'
  | 'recovery_code_verifying'
  | 'lost_recovery_code'
  | 'error';

export interface WidgetState {
  view: View;
  // Data passed between views (email or phone number)
  identifier?: string;
  selectedProvider?: LoginProvider;
  walletAddress?: string; // For WalletConnect when using EthereumProvider directly
  error?: string;
  // OTP login flow state (email or SMS)
  otpLoginStatus?: OtpLoginStatus;
  // Login method: 'email' or 'sms'
  loginMethod?: 'email' | 'sms';
  // Passkey flow state
  passkeyAction?: 'login' | 'register';
  // Farcaster flow state
  farcasterUrl?: string;
  farcasterUsername?: string;
}

export type WidgetAction =
  // Navigation actions
  | { type: 'GO_TO_LOGIN' }
  | { type: 'GO_TO_SMS_LOGIN' }
  // OTP flow (email or SMS)
  | { type: 'OTP_START'; identifier: string; loginMethod?: 'email' | 'sms' }
  | { type: 'OTP_SENT' }
  | { type: 'OTP_INVALID' }
  | { type: 'OTP_EXPIRED' }
  | { type: 'OTP_MAX_ATTEMPTS_REACHED' }
  | { type: 'OTP_VERIFYING' }
  | { type: 'DEVICE_NEEDS_APPROVAL' }
  | { type: 'DEVICE_VERIFICATION_SENT' }
  | { type: 'DEVICE_VERIFICATION_EXPIRED' }
  | { type: 'DEVICE_APPROVED' }
  | { type: 'MFA_REQUIRED' }
  | { type: 'MFA_VERIFYING' }
  | { type: 'MFA_INVALID' }
  | { type: 'LOST_DEVICE' }
  | { type: 'RECOVERY_CODE_VERIFYING' }
  | { type: 'RECOVERY_CODE_INVALID' }
  | { type: 'LOST_RECOVERY_CODE' }
  | { type: 'LOGIN_SUCCESS' }
  | { type: 'RESET_OTP_ERROR' }
  | { type: 'LOGIN_ERROR'; error: string }
  // OAuth flow
  | { type: 'SELECT_PROVIDER'; provider: OAuthProvider }
  | { type: 'GO_TO_ADDITIONAL_PROVIDERS' }
  // Wallet flow
  | { type: 'SELECT_WALLET'; provider: ThirdPartyWallet }
  | { type: 'WALLETCONNECT_CONNECTED'; address: string }
  // Passkey flow
  | { type: 'SELECT_PASSKEY' }
  | { type: 'LOGIN_WITH_PASSKEY' }
  | { type: 'REGISTER_PASSKEY' }
  // Farcaster flow
  | { type: 'SELECT_FARCASTER' }
  | { type: 'FARCASTER_CHANNEL_RECEIVED'; url: string }
  | { type: 'FARCASTER_SUCCESS'; username?: string }
  | { type: 'FARCASTER_FAILED'; error?: string };

export const initialState: WidgetState = {
  view: 'login',
  otpLoginStatus: 'idle',
};

export function widgetReducer(state: WidgetState, action: WidgetAction): WidgetState {
  switch (action.type) {
    // Navigation
    case 'GO_TO_LOGIN':
      return {
        ...initialState,
        selectedProvider: undefined,
        walletAddress: undefined,
        identifier: undefined,
        error: undefined,
        passkeyAction: undefined,
        farcasterUrl: state.farcasterUrl,
      };

    case 'GO_TO_SMS_LOGIN':
      return {
        ...state,
        view: 'sms_login',
        error: undefined,
      };

    // OTP flow (email or SMS)
    case 'OTP_START':
      return {
        ...state,
        identifier: action.identifier,
        loginMethod: action.loginMethod || 'email',
        otpLoginStatus: 'sending',
        error: undefined,
      };

    case 'OTP_SENT':
      return {
        ...state,
        view: 'otp_pending',
        otpLoginStatus: 'otp_sent',
        error: undefined,
      };

    case 'OTP_VERIFYING':
      return {
        ...state,
        otpLoginStatus: 'verifying_otp',
        error: undefined,
      };

    case 'OTP_INVALID':
      return {
        ...state,
        otpLoginStatus: 'invalid_otp',
        error: 'Invalid code. Please try again.',
      };

    case 'OTP_EXPIRED':
      return {
        ...state,
        otpLoginStatus: 'expired_otp',
        error: 'Code expired. Please request a new one.',
      };

    case 'OTP_MAX_ATTEMPTS_REACHED':
      return {
        ...state,
        otpLoginStatus: 'max_attempts_reached',
        error: 'Max attempts reached. Please request a new code.',
      };

    case 'DEVICE_NEEDS_APPROVAL':
      return {
        ...state,
        view: 'device_verification',
        otpLoginStatus: 'device_needs_approval',
        error: undefined,
      };

    case 'DEVICE_VERIFICATION_SENT':
      return {
        ...state,
        view: 'device_verification',
        otpLoginStatus: 'device_verification_sent',
        error: undefined,
      };

    case 'DEVICE_VERIFICATION_EXPIRED':
      return {
        ...state,
        otpLoginStatus: 'device_verification_expired',
        error: 'Verification link expired. Please try again.',
      };

    case 'DEVICE_APPROVED':
      return {
        ...state,
        otpLoginStatus: 'device_approved',
        error: undefined,
      };

    case 'MFA_REQUIRED':
      return {
        ...state,
        view: 'mfa_pending',
        otpLoginStatus: 'mfa_required',
        error: undefined,
      };

    case 'MFA_VERIFYING':
      return {
        ...state,
        otpLoginStatus: 'mfa_verifying',
        error: undefined,
      };

    case 'MFA_INVALID':
      return {
        ...state,
        otpLoginStatus: 'mfa_invalid',
        error: 'Invalid code. Please try again.',
      };

    case 'LOST_DEVICE':
      return {
        ...state,
        view: 'recovery_code',
        otpLoginStatus: 'recovery_code',
        error: undefined,
      };

    case 'RECOVERY_CODE_VERIFYING':
      return {
        ...state,
        otpLoginStatus: 'recovery_code_verifying',
        error: undefined,
      };

    case 'RECOVERY_CODE_INVALID':
      return {
        ...state,
        otpLoginStatus: 'recovery_code',
        error: 'Invalid recovery code. Please try again.',
      };

    case 'LOST_RECOVERY_CODE':
      return {
        ...state,
        view: 'lost_recovery_code',
        otpLoginStatus: 'lost_recovery_code',
        error: undefined,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        view: 'login_success',
        otpLoginStatus: 'success',
        error: undefined,
      };

    case 'LOGIN_ERROR':
      return {
        ...state,
        otpLoginStatus: 'error',
        error: action.error,
      };

    case 'RESET_OTP_ERROR':
      return {
        ...state,
        error: undefined,
      };

    // Wallet flow
    case 'SELECT_WALLET': {
      const isWalletConnect =
        action.provider === ThirdPartyWallets.WALLETCONNECT ||
        action.provider.toLowerCase() === 'walletconnect';
      const walletView = isWalletConnect ? 'walletconnect_pending' : 'wallet_pending';
      return { ...state, view: walletView, selectedProvider: action.provider, error: undefined };
    }

    case 'WALLETCONNECT_CONNECTED':
      return { ...state, view: 'wallet_pending', walletAddress: action.address, selectedProvider: ThirdPartyWallets.WALLETCONNECT };

    // OAuth flow
    case 'SELECT_PROVIDER':
      return { ...state, view: 'oauth_pending', selectedProvider: action.provider, error: undefined };

    case 'GO_TO_ADDITIONAL_PROVIDERS':
      return { ...state, view: 'additional_providers', error: undefined };

    // Passkey flow
    case 'SELECT_PASSKEY':
      return { ...state, view: 'passkey_options', error: undefined };

    case 'LOGIN_WITH_PASSKEY':
      return { ...state, view: 'passkey_pending', passkeyAction: 'login', error: undefined };

    case 'REGISTER_PASSKEY':
      return { ...state, view: 'passkey_pending', passkeyAction: 'register', error: undefined };

    // Farcaster flow
    case 'SELECT_FARCASTER':
      return { ...state, view: 'farcaster_pending', farcasterUsername: undefined, error: undefined };

    case 'FARCASTER_CHANNEL_RECEIVED':
      return { ...state, farcasterUrl: action.url };

    case 'FARCASTER_SUCCESS':
      return { ...state, view: 'farcaster_success', farcasterUsername: action.username, error: undefined };

    case 'FARCASTER_FAILED':
      return { ...state, view: 'farcaster_failed', error: action.error || 'Farcaster login failed' };

    default:
      return state;
  }
}
