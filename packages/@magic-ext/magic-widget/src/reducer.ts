// Widget view state machine

import { LoginProvider, OAuthProvider, ThirdPartyWallet } from './types';

export type View =
  | 'login'
  | 'otp'
  | 'additional_providers'
  | 'wallet_pending'
  | 'oauth_pending'
  | 'email_otp_pending'
  | 'device_verification'
  | 'mfa_pending'
  | 'recovery_code'
  | 'lost_recovery_code'
  | 'login_success';

export type EmailLoginStatus =
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
  // Data passed between views
  email?: string;
  selectedProvider?: LoginProvider;
  error?: string;
  // Email login flow state
  emailLoginStatus?: EmailLoginStatus;
}

export type WidgetAction =
  // Navigation actions
  | { type: 'GO_TO_LOGIN' }
  // Email flow
  | { type: 'EMAIL_OTP_START'; email: string }
  | { type: 'EMAIL_OTP_SENT' }
  | { type: 'EMAIL_OTP_INVALID' }
  | { type: 'EMAIL_OTP_EXPIRED' }
  | { type: 'EMAIL_OTP_MAX_ATTEMPTS_REACHED' }
  | { type: 'EMAIL_OTP_VERIFYING' }
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
  | { type: 'RESET_EMAIL_ERROR' }
  | { type: 'LOGIN_ERROR'; error: string }
  // OAuth flow
  | { type: 'SELECT_PROVIDER'; provider: OAuthProvider }
  | { type: 'GO_TO_ADDITIONAL_PROVIDERS' }
  // Wallet flow
  | { type: 'SELECT_WALLET'; provider: ThirdPartyWallet };

export const initialState: WidgetState = {
  view: 'login',
  emailLoginStatus: 'idle',
};

export function widgetReducer(state: WidgetState, action: WidgetAction): WidgetState {
  switch (action.type) {
    // Navigation
    case 'GO_TO_LOGIN':
      return { ...initialState };

    // Email OTP flow
    case 'EMAIL_OTP_START':
      return {
        ...state,
        email: action.email,
        emailLoginStatus: 'sending',
        error: undefined,
      };

    case 'EMAIL_OTP_SENT':
      return {
        ...state,
        view: 'email_otp_pending',
        emailLoginStatus: 'otp_sent',
        error: undefined,
      };

    case 'EMAIL_OTP_VERIFYING':
      return {
        ...state,
        emailLoginStatus: 'verifying_otp',
        error: undefined,
      };

    case 'EMAIL_OTP_INVALID':
      return {
        ...state,
        emailLoginStatus: 'invalid_otp',
        error: 'Invalid code. Please try again.',
      };

    case 'EMAIL_OTP_EXPIRED':
      return {
        ...state,
        emailLoginStatus: 'expired_otp',
        error: 'Code expired. Please request a new one.',
      };

    case 'EMAIL_OTP_MAX_ATTEMPTS_REACHED':
      return {
        ...state,
        emailLoginStatus: 'max_attempts_reached',
        error: 'Max attempts reached. Please request a new code.',
      };

    case 'DEVICE_NEEDS_APPROVAL':
      return {
        ...state,
        view: 'device_verification',
        emailLoginStatus: 'device_needs_approval',
        error: undefined,
      };

    case 'DEVICE_VERIFICATION_SENT':
      return {
        ...state,
        view: 'device_verification',
        emailLoginStatus: 'device_verification_sent',
        error: undefined,
      };

    case 'DEVICE_VERIFICATION_EXPIRED':
      return {
        ...state,
        emailLoginStatus: 'device_verification_expired',
        error: 'Verification link expired. Please try again.',
      };

    case 'DEVICE_APPROVED':
      return {
        ...state,
        emailLoginStatus: 'device_approved',
        error: undefined,
      };

    case 'MFA_REQUIRED':
      return {
        ...state,
        view: 'mfa_pending',
        emailLoginStatus: 'mfa_required',
        error: undefined,
      };

    case 'MFA_VERIFYING':
      return {
        ...state,
        emailLoginStatus: 'mfa_verifying',
        error: undefined,
      };

    case 'MFA_INVALID':
      return {
        ...state,
        emailLoginStatus: 'mfa_invalid',
        error: 'Invalid code. Please try again.',
      };

    case 'LOST_DEVICE':
      return {
        ...state,
        view: 'recovery_code',
        emailLoginStatus: 'recovery_code',
        error: undefined,
      };

    case 'RECOVERY_CODE_VERIFYING':
      return {
        ...state,
        emailLoginStatus: 'recovery_code_verifying',
        error: undefined,
      };

    case 'RECOVERY_CODE_INVALID':
      return {
        ...state,
        emailLoginStatus: 'recovery_code',
        error: 'Invalid recovery code. Please try again.',
      };

    case 'LOST_RECOVERY_CODE':
      return {
        ...state,
        view: 'lost_recovery_code',
        emailLoginStatus: 'lost_recovery_code',
        error: undefined,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        view: 'login_success',
        emailLoginStatus: 'success',
        error: undefined,
      };

    case 'LOGIN_ERROR':
      return {
        ...state,
        emailLoginStatus: 'error',
        error: action.error,
      };

    case 'RESET_EMAIL_ERROR':
      return {
        ...state,
        error: undefined,
      };

    // Wallet flow
    case 'SELECT_WALLET':
      return { ...state, view: 'wallet_pending', selectedProvider: action.provider, error: undefined };

    // OAuth flow
    case 'SELECT_PROVIDER':
      return { ...state, view: 'oauth_pending', selectedProvider: action.provider, error: undefined };

    case 'GO_TO_ADDITIONAL_PROVIDERS':
      return { ...state, view: 'additional_providers', error: undefined };

    default:
      return state;
  }
}
