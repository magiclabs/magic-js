export interface PasskeyResult {
  // null if skipDIDToken is true
  idToken: string | null;

  // Info of the device used to authenticate
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  id: string;
  nickname: string;
  transport: string;
  userAgent: string;
}

export interface PasskeyMetadata {
  devicesInfo: DeviceInfo[];
}

export enum PasskeyMFAEventEmit {
  Cancel = 'cancel',
  VerifyMFACode = 'verify-mfa-code',
  LostDevice = 'lost-device',
  VerifyRecoveryCode = 'verify-recovery-code',
}
export enum PasskeyMFAEventOnReceived {
  MfaSentHandle = 'mfa-sent-handle',
  InvalidMfaOtp = 'invalid-mfa-otp',
  RecoveryCodeSentHandle = 'recovery-code-sent-handle',
  InvalidRecoveryCode = 'invalid-recovery-code',
  RecoveryCodeSuccess = 'recovery-code-success',
}

export type PasskeyEventHandlers = {
  // Event sent
  [PasskeyMFAEventEmit.Cancel]: () => void;
  [PasskeyMFAEventEmit.VerifyMFACode]: (mfa: string) => void;
  [PasskeyMFAEventEmit.LostDevice]: () => void;
  [PasskeyMFAEventEmit.VerifyRecoveryCode]: (recoveryCode: string) => void;
  // Event Received
  [PasskeyMFAEventOnReceived.MfaSentHandle]: () => void;
  [PasskeyMFAEventOnReceived.InvalidMfaOtp]: () => void;
  [PasskeyMFAEventOnReceived.RecoveryCodeSentHandle]: () => void;
  [PasskeyMFAEventOnReceived.InvalidRecoveryCode]: () => void;
  [PasskeyMFAEventOnReceived.RecoveryCodeSuccess]: () => void;
};
