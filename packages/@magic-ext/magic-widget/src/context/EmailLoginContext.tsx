import React, { createContext, useContext, useRef, useCallback, ReactNode } from 'react';
import { getExtensionInstance } from '../extension';
import { WidgetAction } from '../reducer';
import {
  DeviceVerificationEventEmit,
  DeviceVerificationEventOnReceived,
  LoginWithEmailOTPEventEmit,
  LoginWithEmailOTPEventOnReceived,
} from '@magic-sdk/types';
import { useWidgetConfig } from './WidgetConfigContext';

// Type for the login handle returned by loginWithEmailOTP
type EmailOTPHandle = ReturnType<ReturnType<typeof getExtensionInstance>['loginWithEmailOTP']>;

interface EmailLoginContextValue {
  /** Start the email OTP login flow */
  startEmailLogin: (email: string) => void;
  /** Submit the OTP code for verification */
  submitOTP: (otp: string) => void;
  /** Submit the TOTP code for MFA verification */
  submitMFA: (totp: string) => void;
  /** Lost device */
  lostDevice: () => void;
  /** Submit recovery code for verification */
  submitRecoveryCode: (recoveryCode: string) => void;
  /** Cancel the current login flow */
  cancelLogin: () => void;
  /** Retry device verification */
  retryDeviceVerification: () => void;
  /** Resend the email OTP */
  resendEmailOTP: () => void;
  /** Current email being used for login */
  email: string | null;
}

const EmailLoginContext = createContext<EmailLoginContextValue | null>(null);

interface EmailLoginProviderProps {
  children: ReactNode;
  dispatch: React.Dispatch<WidgetAction>;
}

export function EmailLoginProvider({ children, dispatch }: EmailLoginProviderProps) {
  const { handleSuccess, handleError } = useWidgetConfig();

  // Store the current login handle
  const handleRef = useRef<EmailOTPHandle | null>(null);
  const emailRef = useRef<string | null>(null);

  /**
   * Start the email OTP login flow
   * Sets up all event listeners and manages state transitions
   */
  const startEmailLogin = useCallback(
    (email: string) => {
      emailRef.current = email;
      dispatch({ type: 'EMAIL_OTP_START', email });

      try {
        const extension = getExtensionInstance();
        const handle = extension.loginWithEmailOTP(email);
        handleRef.current = handle;

        // ==========================================
        // Email OTP Events
        // ==========================================

        // OTP was sent successfully
        handle.on(LoginWithEmailOTPEventOnReceived.EmailOTPSent, () => {
          dispatch({ type: 'EMAIL_OTP_SENT' });
        });

        // Invalid OTP entered
        handle.on(LoginWithEmailOTPEventOnReceived.InvalidEmailOtp, () => {
          dispatch({ type: 'EMAIL_OTP_INVALID' });
        });

        // OTP has expired
        handle.on(LoginWithEmailOTPEventOnReceived.ExpiredEmailOtp, () => {
          dispatch({ type: 'EMAIL_OTP_EXPIRED' });
        });

        // Login throttled (too many attempts)
        handle.on(LoginWithEmailOTPEventOnReceived.LoginThrottled, () => {
          dispatch({ type: 'LOGIN_ERROR', error: 'Too many login attempts. Please try again later.' });
        });

        // Max attempts reached
        handle.on(LoginWithEmailOTPEventOnReceived.MaxAttemptsReached, () => {
          dispatch({ type: 'EMAIL_OTP_MAX_ATTEMPTS_REACHED' });
        });

        // ==========================================
        // Device Verification Events
        // ==========================================

        // Device needs approval (unrecognized device)
        handle.on(DeviceVerificationEventOnReceived.DeviceNeedsApproval, () => {
          dispatch({ type: 'DEVICE_NEEDS_APPROVAL' });
        });

        // Device verification email sent
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
        // MFA Events (if enabled)
        // ==========================================

        handle.on(LoginWithEmailOTPEventOnReceived.MfaSentHandle, () => {
          dispatch({ type: 'MFA_REQUIRED' });
        });

        handle.on(LoginWithEmailOTPEventOnReceived.InvalidMfaOtp, () => {
          dispatch({ type: 'MFA_INVALID' });
        });

        // ==========================================
        // Recovery Code Events
        // ==========================================

        handle.on(LoginWithEmailOTPEventOnReceived.InvalidRecoveryCode, () => {
          dispatch({ type: 'RECOVERY_CODE_INVALID' });
        });

        // ==========================================
        // Handle Promise Resolution
        // ==========================================

        handle
          .then(didToken => {
            if (didToken) {
              dispatch({ type: 'LOGIN_SUCCESS' });
              handleSuccess({ method: 'email', didToken });
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
        dispatch({ type: 'EMAIL_OTP_VERIFYING' });
        handleRef.current.emit(LoginWithEmailOTPEventEmit.VerifyEmailOtp, otp);
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
        handleRef.current.emit(LoginWithEmailOTPEventEmit.VerifyMFACode, totp);
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
      handleRef.current.emit(LoginWithEmailOTPEventEmit.LostDevice);
    }
  }, [dispatch]);

  /**
   * Submit recovery code for verification
   */
  const submitRecoveryCode = useCallback(
    (recoveryCode: string) => {
      if (handleRef.current) {
        dispatch({ type: 'RECOVERY_CODE_VERIFYING' });
        handleRef.current.emit(LoginWithEmailOTPEventEmit.VerifyRecoveryCode, recoveryCode);
      }
    },
    [dispatch],
  );

  /**
   * Cancel the current login flow
   */
  const cancelLogin = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.emit(LoginWithEmailOTPEventEmit.Cancel);
    }
    handleRef.current = null;
    emailRef.current = null;
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

  const resendEmailOTP = useCallback(() => {
    const email = emailRef.current;

    if (handleRef.current) {
      handleRef.current.emit(LoginWithEmailOTPEventEmit.Cancel);
    }
    handleRef.current = null;
    emailRef.current = null;

    if (!email) {
      return dispatch({ type: 'LOGIN_ERROR', error: 'Internal error: No email found' });
    }

    startEmailLogin(email);
  }, [startEmailLogin]);

  const value: EmailLoginContextValue = {
    startEmailLogin,
    submitOTP,
    submitMFA,
    lostDevice,
    submitRecoveryCode,
    cancelLogin,
    retryDeviceVerification,
    resendEmailOTP,
    email: emailRef.current,
  };

  return <EmailLoginContext.Provider value={value}>{children}</EmailLoginContext.Provider>;
}

/**
 * Hook to access the email login context
 * @throws Error if used outside of EmailLoginProvider
 */
export function useEmailLogin(): EmailLoginContextValue {
  const context = useContext(EmailLoginContext);
  if (!context) {
    throw new Error('useEmailLogin must be used within an EmailLoginProvider');
  }
  return context;
}
