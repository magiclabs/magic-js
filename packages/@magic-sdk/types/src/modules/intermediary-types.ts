import { ThirdPartyWalletEvents } from '../core/json-rpc-types';
import {
  AuthEventOnReceived,
  DeviceVerificationEventEmit,
  DeviceVerificationEventOnReceived,
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
  DisableMFAEventOnReceived,
  DisableMFAEventEmit,
  FarcasterLoginEventEmit,
} from './auth-types';
import { NftCheckoutIntermediaryEvents } from './nft-types';

import { WalletEventOnReceived } from './wallet-types';
import { UiEventsEmit } from './common-types';
import {
  RecoverAccountEventEmit,
  RecoverAccountEventOnReceived,
  RecoveryFactorEventEmit,
  RecoveryFactorEventOnReceived,
} from './user-types';
import { OAuthPopupEventEmit, OAuthPopupEventOnReceived } from '@magic-ext/oauth2';

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
  // Third Party Wallet Events
  | `${ThirdPartyWalletEvents}`
  // Nft Checkout Events
  | `${NftCheckoutIntermediaryEvents}`
  // Auth Events
  | `${AuthEventOnReceived}`
  | `${WalletEventOnReceived}`
  // Show Settings Events
  | `${RecoveryFactorEventOnReceived}`
  | `${RecoveryFactorEventEmit}`
  // Nft Checkout Events
  | `${NftCheckoutIntermediaryEvents}`
  // Farcaster Login Events
  | `${FarcasterLoginEventEmit}`
  // Ui Events
  | `${UiEventsEmit}`
  // Enable MFA Events
  | `${EnableMFAEventOnReceived}`
  | `${EnableMFAEventEmit}`
  // Disable MFA Events
  | `${DisableMFAEventOnReceived}`
  | `${DisableMFAEventEmit}`
  // Recover Account Events
  | `${RecoverAccountEventOnReceived}`
  | `${RecoverAccountEventEmit}`
  // OAuth Events
  | `${OAuthPopupEventEmit}`
  | `${OAuthPopupEventOnReceived}`;
