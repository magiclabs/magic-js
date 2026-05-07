/**
 * Minimal ambient types for the subset of Google Identity Services (GSI) we use.
 * Full reference: https://developers.google.com/identity/gsi/web/reference/js-reference
 *
 * We declare only what `gsi-loader.ts` and the extension's `show()` flow touch,
 * to avoid pulling in `@types/google.accounts` as a runtime dependency.
 */

export interface GoogleCredentialResponse {
  /** The Google-issued ID token JWT to forward to Magic. */
  credential: string;
  /** Heuristic for how the credential was selected (auto, btn, btn_confirm, etc.). */
  select_by?: string;
  clientId?: string;
}

export interface GoogleNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
  getMomentType: () => 'display' | 'skipped' | 'dismissed';
}

export interface GoogleIdInitializeOptions {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  use_fedcm_for_prompt?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: 'signin' | 'signup' | 'use';
  ux_mode?: 'popup' | 'redirect';
  itp_support?: boolean;
}

export interface GoogleAccountsId {
  initialize: (options: GoogleIdInitializeOptions) => void;
  prompt: (notification?: (n: GoogleNotification) => void) => void;
  cancel: () => void;
  disableAutoSelect: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

export {};
