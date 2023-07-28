import {
  DeviceVerificationEventEmit,
  DeviceVerificationEventOnReceived,
  LoginWithEmailOTPEventEmit,
  LoginWithEmailOTPEventOnReceived,
  LoginWithMagicLinkEventEmit,
  LoginWithMagicLinkEventOnReceived,
} from './auth-types';

export type IntermediaryEvents =
  // EmailOTP
  LoginWithEmailOTPEventEmit &
    LoginWithEmailOTPEventOnReceived &
    // MagicLink
    LoginWithMagicLinkEventEmit &
    LoginWithMagicLinkEventOnReceived &
    // Device Verification
    DeviceVerificationEventOnReceived &
    DeviceVerificationEventEmit;
