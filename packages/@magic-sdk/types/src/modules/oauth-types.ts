// Shared MFA events reused by both popup and redirect flows
export enum OAuthMFAEventEmit {
  Cancel = 'cancel',
  VerifyMFACode = 'verify-mfa-code',
  LostDevice = 'lost-device',
  VerifyRecoveryCode = 'verify-recovery-code',
}

export enum OAuthMFAEventOnReceived {
  MfaSentHandle = 'mfa-sent-handle',
  InvalidMfaOtp = 'invalid-mfa-otp',
  RecoveryCodeSentHandle = 'recovery-code-sent-handle',
  InvalidRecoveryCode = 'invalid-recovery-code',
  RecoveryCodeSuccess = 'recovery-code-success',
}

type OAuthMFAEventHandlers = {
  // Event sent
  [OAuthMFAEventEmit.Cancel]: () => void;
  [OAuthMFAEventEmit.VerifyMFACode]: (mfa: string) => void;
  [OAuthMFAEventEmit.LostDevice]: () => void;
  [OAuthMFAEventEmit.VerifyRecoveryCode]: (recoveryCode: string) => void;
  // Event Received
  [OAuthMFAEventOnReceived.MfaSentHandle]: () => void;
  [OAuthMFAEventOnReceived.InvalidMfaOtp]: () => void;
  [OAuthMFAEventOnReceived.RecoveryCodeSentHandle]: () => void;
  [OAuthMFAEventOnReceived.InvalidRecoveryCode]: () => void;
  [OAuthMFAEventOnReceived.RecoveryCodeSuccess]: () => void;
};

// Popup-specific events
export enum OAuthPopupEventOnReceived {
  PopupUrl = 'popup-url',
}

export enum OAuthPopupEventEmit {
  PopupEvent = 'popup-event',
}

export type OAuthPopupEventHandlers = {
  [OAuthPopupEventEmit.PopupEvent]: (eventData: unknown) => void;
  [OAuthPopupEventOnReceived.PopupUrl]: (event: { popupUrl: string; provider: string }) => void;
} & OAuthMFAEventHandlers;

// Redirect-specific handler type
export type OAuthGetResultEventHandlers = OAuthMFAEventHandlers;
