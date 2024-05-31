import { ThirdPartyWalletEvents } from '../core/json-rpc-types';
import {
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
import { NftCheckoutEventEmit, NftCheckoutEventOnReceived } from './nft-types';

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
  // Third Party Wallet Events
  | `${ThirdPartyWalletEvents}`
  // Nft Checkout Events
  | `${NftCheckoutEventEmit}`
  | `${NftCheckoutEventOnReceived}`;
