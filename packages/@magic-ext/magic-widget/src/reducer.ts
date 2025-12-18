// Widget view state machine

import { LoginProvider, OAuthProvider, ThirdPartyWallets } from './types';

export type View = 'login' | 'otp' | 'additional_providers' | 'wallet_pending' | 'oauth_pending';

export interface WidgetState {
  view: View;
  // Data passed between views
  email?: string;
  selectedProvider?: LoginProvider;
  error?: string;
}

export type WidgetAction =
  // Navigation actions
  | { type: 'GO_TO_LOGIN' }
  // Email flow
  | { type: 'VERIFY_OTP'; email: string }
  // OAuth flow
  | { type: 'SELECT_PROVIDER'; provider: OAuthProvider }
  | { type: 'GO_TO_ADDITIONAL_PROVIDERS' }
  // Wallet flow
  | { type: 'SELECT_WALLET'; provider: ThirdPartyWallets };
export const initialState: WidgetState = {
  view: 'login',
};

export function widgetReducer(state: WidgetState, action: WidgetAction): WidgetState {
  switch (action.type) {
    // Navigation
    case 'GO_TO_LOGIN':
      return { ...state, view: 'login', error: undefined };

    // Email flow
    case 'VERIFY_OTP':
      return { ...state, view: 'otp', email: action.email, error: undefined };

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
