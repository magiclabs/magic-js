import {
  AuthEventOnReceived,
  DeviceVerificationEventEmit,
  DeviceVerificationEventOnReceived,
  LoginWithEmailOTPEventEmit,
  LoginWithEmailOTPEventOnReceived,
  LoginWithMagicLinkEventEmit,
  LoginWithMagicLinkEventOnReceived,
  RecencyCheckEventEmit,
  RecencyCheckEventOnReceived,
  UpdateEmailEventEmit,
  UpdateEmailEventOnReceived,
} from './auth-types';

import { WalletEventOnReceived } from './wallet-types';

export type IntermediaryEvents =
  // EmailOTP
  | `${LoginWithEmailOTPEventEmit}`
  | `${LoginWithEmailOTPEventOnReceived}`
  // MagicLink
  | `${LoginWithMagicLinkEventEmit}`
  | `${LoginWithMagicLinkEventOnReceived}`
  // Device Verification
  | `${DeviceVerificationEventEmit}`
  | `${DeviceVerificationEventOnReceived}`
  // Recency Check
  | `${RecencyCheckEventEmit}`
  | `${RecencyCheckEventOnReceived}`
  // Update Email Events
  | `${UpdateEmailEventOnReceived}`
  | `${UpdateEmailEventEmit}`
  // Auth Events
  | `${AuthEventOnReceived}`
  | `${WalletEventOnReceived}`;
