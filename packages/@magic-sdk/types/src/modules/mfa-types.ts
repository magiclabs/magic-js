export enum MfaEventEmit {
  SelectedMfaType = 'selected-mfa-type',
  MfaPasskeyAssertionResponse = 'mfa-passkey-assertion-response',
  MfaPasskeyAssertionError = 'mfa-passkey-assertion-error',
  LostDevice = 'lost-device',
}
export enum MfaEventOnReceived {
  SelectMfaType = 'select-mfa-type',
  MfaPasskeyOptions = 'mfa-passkey-options',
  MfaSentHandle = 'mfa-sent-handle',
  RecoveryCodeSentHandle = 'recovery-code-sent-handle',
  InvalidRecoveryCode = 'invalid-recovery-code',
  RecoveryCodeSuccess = 'recovery-code-success',
}

export type MfaEventHandlers = {
  [MfaEventEmit.SelectedMfaType]: (mfaType: 'totp' | 'passkey') => {};
  [MfaEventEmit.MfaPasskeyAssertionResponse]: (assertionResponse: any) => {};
  [MfaEventEmit.MfaPasskeyAssertionError]: (errorMsg: string) => {};
  [MfaEventEmit.LostDevice]: () => {};

  [MfaEventOnReceived.SelectMfaType]: () => {};
  [MfaEventOnReceived.MfaPasskeyOptions]: ({ webauthnOptions }: { webauthnOptions: any }) => {};
  [MfaEventOnReceived.MfaSentHandle]: () => void;
  [MfaEventOnReceived.RecoveryCodeSentHandle]: () => void;
  [MfaEventOnReceived.InvalidRecoveryCode]: () => void;
  [MfaEventOnReceived.RecoveryCodeSuccess]: () => void;
};
