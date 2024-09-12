import {
  AuthEventOnReceived,
  DeviceVerificationEventEmit,
  DeviceVerificationEventOnReceived,
  FarcasterLoginEventEmit,
  LoginWithEmailOTPEventEmit,
  LoginWithSmsOTPEventEmit,
  LoginWithEmailOTPEventOnReceived,
  LoginWithMagicLinkEventEmit,
  LoginWithMagicLinkEventOnReceived,
  RecencyCheckEventEmit,
  RecencyCheckEventOnReceived,
  UpdateEmailEventEmit,
  UpdateEmailEventOnReceived,
  LoginWithSmsOTPEventOnReceived,
  EnableMFAEventEmit,
  EnableMFAEventOnReceived,
} from './auth-types';
import { NftCheckoutIntermediaryEvents } from './nft-types';

import { WalletEventOnReceived } from './wallet-types';
import { UiEventsEmit } from './common-types';

export type IntermediaryEvents =
  // EmailOTP
  | `${LoginWithEmailOTPEventEmit}`
  | `${LoginWithEmailOTPEventOnReceived}`
  // SmsOTP
  | `${LoginWithSmsOTPEventEmit}`
  | `${LoginWithSmsOTPEventOnReceived}`
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
  | `${WalletEventOnReceived}`
  // Nft Checkout Events
  | `${NftCheckoutIntermediaryEvents}`
  // Farcaster Login Events
  | `${FarcasterLoginEventEmit}`
  // Ui Events
  | `${UiEventsEmit}`
  // Enable MFA Events
  | `${EnableMFAEventOnReceived}`
  | `${EnableMFAEventEmit}`;
