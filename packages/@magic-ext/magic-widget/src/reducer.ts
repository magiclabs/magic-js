// Widget view state machine

export type View = 'login' | 'email_input' | 'otp' | 'wallet_pending' | 'success' | 'error';

export interface WidgetState {
  view: View;
  // Data passed between views
  email?: string;
  selectedWallet?: string;
  error?: string;
}

export type WidgetAction =
  // Navigation actions
  | { type: 'GO_TO_EMAIL_INPUT' }
  | { type: 'GO_TO_LOGIN' }
  // Email flow
  | { type: 'SUBMIT_EMAIL'; email: string }
  | { type: 'VERIFY_OTP_SUCCESS' }
  // Wallet flow
  | { type: 'SELECT_WALLET'; wallet: string }
  | { type: 'WALLET_CONNECTED' }
  // Error handling
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

export const initialState: WidgetState = {
  view: 'login',
};

export function widgetReducer(state: WidgetState, action: WidgetAction): WidgetState {
  switch (action.type) {
    // Navigation
    case 'GO_TO_EMAIL_INPUT':
      return { ...state, view: 'email_input', error: undefined };

    case 'GO_TO_LOGIN':
      return { ...state, view: 'login', error: undefined };

    // Email flow
    case 'SUBMIT_EMAIL':
      return { ...state, view: 'otp', email: action.email, error: undefined };

    case 'VERIFY_OTP_SUCCESS':
      return { ...state, view: 'success', error: undefined };

    // Wallet flow
    case 'SELECT_WALLET':
      return { ...state, view: 'wallet_pending', selectedWallet: action.wallet, error: undefined };

    case 'WALLET_CONNECTED':
      return { ...state, view: 'success', error: undefined };

    // Error handling
    case 'SET_ERROR':
      return { ...state, view: 'error', error: action.error };

    case 'CLEAR_ERROR':
      return { ...state, error: undefined };

    default:
      return state;
  }
}
