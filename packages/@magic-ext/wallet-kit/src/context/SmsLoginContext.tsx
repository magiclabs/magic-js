import {
  DeviceVerificationEventEmit,
  DeviceVerificationEventOnReceived,
  LoginWithSmsOTPEventEmit,
  LoginWithSmsOTPEventOnReceived,
} from '@magic-sdk/types';
import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { getExtensionInstance } from '../extension';
import { WidgetAction } from '../reducer';
import { useWidgetConfig } from './WidgetConfigContext';

type SmsOTPHandle = ReturnType<ReturnType<typeof getExtensionInstance>['loginWithSMS']>;

interface SmsLoginContextValue {
  startSmsLogin: (phoneNumber: string) => void;
  submitOTP: (otp: string) => void;
  submitMFA: (totp: string) => void;
  lostDevice: () => void;
  submitRecoveryCode: (recoveryCode: string) => void;
  cancelLogin: () => void;
  retryDeviceVerification: () => void;
  resendSmsOTP: () => void;
  phoneNumber: string | null;
  isSmsLoginActive: boolean;
}

const SmsLoginContext = createContext<SmsLoginContextValue | null>(null);

interface SmsLoginProviderProps {
  children: ReactNode;
  dispatch: React.Dispatch<WidgetAction>;
}

export function SmsLoginProvider({ children, dispatch }: SmsLoginProviderProps) {
  const { handleSuccess, handleError } = useWidgetConfig();

  const handleRef = useRef<SmsOTPHandle | null>(null);
  const phoneNumberRef = useRef<string | null>(null);
  const [isSmsLoginActive, setIsSmsLoginActive] = useState(false);

  /**
   * Start the SMS OTP login flow
   * Sets up all event listeners and manages state transitions
   */
  const startSmsLogin = useCallback(
    (phoneNumber: string) => {
      phoneNumberRef.current = phoneNumber;
      setIsSmsLoginActive(true);
      dispatch({ type: 'OTP_START', identifier: phoneNumber, loginMethod: 'sms' });

      try {
        const extension = getExtensionInstance();
        const handle = extension.loginWithSMS(phoneNumber);
        handleRef.current = handle;

        // ==========================================
        // SMS OTP Events
        // ==========================================

        // OTP was sent successfully
        handle.on(LoginWithSmsOTPEventOnReceived.SmsOTPSent, () => {
          dispatch({ type: 'OTP_SENT' });
        });

        // Invalid OTP entered
        handle.on(LoginWithSmsOTPEventOnReceived.InvalidSmsOtp, () => {
          dispatch({ type: 'OTP_INVALID' });
        });

        // OTP has expired
        handle.on(LoginWithSmsOTPEventOnReceived.ExpiredSmsOtp, () => {
          dispatch({ type: 'OTP_EXPIRED' });
        });

        // Login throttled (too many attempts)
        handle.on(LoginWithSmsOTPEventOnReceived.LoginThrottled, () => {
          dispatch({ type: 'LOGIN_ERROR', error: 'Too many login attempts. Please try again later.' });
        });

        // ==========================================
        // Device Verification Events
        // ==========================================

        // Device needs approval (unrecognized device)
        handle.on(DeviceVerificationEventOnReceived.DeviceNeedsApproval, () => {
          dispatch({ type: 'DEVICE_NEEDS_APPROVAL' });
        });

        // Device verification sms sent
        handle.on(DeviceVerificationEventOnReceived.DeviceVerificationEmailSent, () => {
          dispatch({ type: 'DEVICE_VERIFICATION_SENT' });
        });

        // Device verification link expired
        handle.on(DeviceVerificationEventOnReceived.DeviceVerificationLinkExpired, () => {
          dispatch({ type: 'DEVICE_VERIFICATION_EXPIRED' });
        });

        // Device approved successfully
        handle.on(DeviceVerificationEventOnReceived.DeviceApproved, () => {
          dispatch({ type: 'DEVICE_APPROVED' });
        });

        // ==========================================
        // MFA Events
        // ==========================================

        handle.on(LoginWithSmsOTPEventOnReceived.MfaSentHandle, () => {
          dispatch({ type: 'MFA_REQUIRED' });
        });

        handle.on(LoginWithSmsOTPEventOnReceived.InvalidMfaOtp, () => {
          dispatch({ type: 'MFA_INVALID' });
        });

        // ==========================================
        // Recovery Code Events
        // ==========================================

        handle.on(LoginWithSmsOTPEventOnReceived.InvalidRecoveryCode, () => {
          dispatch({ type: 'RECOVERY_CODE_INVALID' });
        });

        // ==========================================
        // Handle Promise Resolution
        // ==========================================

        handle
          .then(didToken => {
            if (didToken) {
              dispatch({ type: 'LOGIN_SUCCESS' });
              handleSuccess({ method: 'sms', didToken });
            }
          })
          .catch(error => {
            const errorInstance = error instanceof Error ? error : new Error(error?.message || 'Login failed');
            dispatch({ type: 'LOGIN_ERROR', error: errorInstance.message });
            handleError(errorInstance);
          });
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error('Failed to start login');
        dispatch({
          type: 'LOGIN_ERROR',
          error: errorInstance.message,
        });
        handleError(errorInstance);
      }
    },
    [dispatch, handleSuccess, handleError],
  );

  /**
   * Submit OTP code for verification
   */
  const submitOTP = useCallback(
    (otp: string) => {
      if (handleRef.current) {
        dispatch({ type: 'OTP_VERIFYING' });
        handleRef.current.emit(LoginWithSmsOTPEventEmit.VerifySmsOtp, otp);
      }
    },
    [dispatch],
  );

  /**
   * Submit MFA code for verification
   */
  const submitMFA = useCallback(
    (totp: string) => {
      if (handleRef.current) {
        dispatch({ type: 'MFA_VERIFYING' });
        handleRef.current.emit(LoginWithSmsOTPEventEmit.VerifyMFACode, totp);
      }
    },
    [dispatch],
  );

  /**
   * Lost device
   */
  const lostDevice = useCallback(() => {
    if (handleRef.current) {
      dispatch({ type: 'LOST_DEVICE' });
      handleRef.current.emit(LoginWithSmsOTPEventEmit.LostDevice);
    }
  }, [dispatch]);

  /**
   * Submit recovery code for verification
   */
  const submitRecoveryCode = useCallback(
    (recoveryCode: string) => {
      if (handleRef.current) {
        dispatch({ type: 'RECOVERY_CODE_VERIFYING' });
        handleRef.current.emit(LoginWithSmsOTPEventEmit.VerifyRecoveryCode, recoveryCode);
      }
    },
    [dispatch],
  );

  /**
   * Cancel the current login flow
   */
  const cancelLogin = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.emit(LoginWithSmsOTPEventEmit.Cancel);
    }
    handleRef.current = null;
    phoneNumberRef.current = null;
    setIsSmsLoginActive(false);
    dispatch({ type: 'GO_TO_LOGIN' });
  }, [dispatch]);

  /**
   * Retry device verification
   */
  const retryDeviceVerification = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.emit(DeviceVerificationEventEmit.Retry);
    }
  }, []);

  const resendSmsOTP = useCallback(() => {
    const phoneNumber = phoneNumberRef.current;

    if (handleRef.current) {
      handleRef.current.emit(LoginWithSmsOTPEventEmit.Cancel);
    }
    handleRef.current = null;
    phoneNumberRef.current = null;

    if (!phoneNumber) {
      return dispatch({ type: 'LOGIN_ERROR', error: 'Internal error: No phone number found' });
    }

    startSmsLogin(phoneNumber);
  }, [startSmsLogin, dispatch]);

  const value: SmsLoginContextValue = {
    startSmsLogin,
    submitOTP,
    submitMFA,
    lostDevice,
    submitRecoveryCode,
    cancelLogin,
    retryDeviceVerification,
    resendSmsOTP,
    phoneNumber: phoneNumberRef.current,
    isSmsLoginActive,
  };

  return <SmsLoginContext.Provider value={value}>{children}</SmsLoginContext.Provider>;
}

/**
 * Hook to access the SMS login context
 * @throws Error if used outside of SmsLoginProvider
 */
export function useSmsLogin(): SmsLoginContextValue {
  const context = useContext(SmsLoginContext);
  if (!context) {
    throw new Error('useSmsLogin must be used within a SmsLoginProvider');
  }
  return context;
}
