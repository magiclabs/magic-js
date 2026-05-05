import React, { createContext, useContext, useRef, useCallback, ReactNode } from 'react';
import { getExtensionInstance } from '../extension';
import { WidgetAction } from '../reducer';
import { PasskeyMFAEventEmit, PasskeyMFAEventOnReceived } from '@magic-sdk/types';
import { useWidgetConfig } from './WidgetConfigContext';

type PasskeyHandle = ReturnType<ReturnType<typeof getExtensionInstance>['loginWithPasskey']>;

interface PasskeyLoginContextValue {
  startPasskeyLogin: () => void;
  startPasskeyRegister: (username?: string) => void;
  submitMFA: (totp: string) => void;
  lostDevice: () => void;
  submitRecoveryCode: (recoveryCode: string) => void;
  cancelLogin: () => void;
  isPasskeyLoginActive: boolean;
}

const PasskeyLoginContext = createContext<PasskeyLoginContextValue | null>(null);

interface PasskeyLoginProviderProps {
  children: ReactNode;
  dispatch: React.Dispatch<WidgetAction>;
}

export function PasskeyLoginProvider({ children, dispatch }: PasskeyLoginProviderProps) {
  const { handleSuccess, handleError } = useWidgetConfig();

  const handleRef = useRef<PasskeyHandle | null>(null);
  const isActiveRef = useRef<boolean>(false);

  /**
   * Start the passkey login flow
   * Sets up all event listeners and manages state transitions
   */
  const startPasskeyLogin = useCallback(() => {
    isActiveRef.current = true;

    try {
      const extension = getExtensionInstance();
      const handle = extension.loginWithPasskey();
      handleRef.current = handle;

      // ==========================================
      // MFA Events (if enabled)
      // ==========================================

      handle.on(PasskeyMFAEventOnReceived.MfaSentHandle, () => {
        dispatch({ type: 'MFA_REQUIRED' });
      });

      handle.on(PasskeyMFAEventOnReceived.InvalidMfaOtp, () => {
        dispatch({ type: 'MFA_INVALID' });
      });

      // ==========================================
      // Recovery Code Events
      // ==========================================

      handle.on(PasskeyMFAEventOnReceived.InvalidRecoveryCode, () => {
        dispatch({ type: 'RECOVERY_CODE_INVALID' });
      });

      handle.on(PasskeyMFAEventOnReceived.RecoveryCodeSentHandle, () => {
        // Recovery code was sent - stay in recovery view
      });

      handle.on(PasskeyMFAEventOnReceived.RecoveryCodeSuccess, () => {
        // Recovery code accepted - login will complete
      });

      // ==========================================
      // Handle Promise Resolution
      // ==========================================

      handle
        .then(result => {
          dispatch({ type: 'LOGIN_SUCCESS' });
          handleSuccess({
            method: 'passkey',
            didToken: result.idToken,
            deviceInfo: result.deviceInfo,
          });
        })
        .catch(error => {
          const errorInstance = error instanceof Error ? error : new Error(error?.message || 'Passkey login failed');
          dispatch({ type: 'LOGIN_ERROR', error: errorInstance.message });
          handleError(errorInstance);
        })
        .finally(() => {
          isActiveRef.current = false;
        });
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error('Failed to start passkey login');
      dispatch({
        type: 'LOGIN_ERROR',
        error: errorInstance.message,
      });
      handleError(errorInstance);
      isActiveRef.current = false;
    }
  }, [dispatch, handleSuccess, handleError]);

  /**
   * Submit MFA code for verification
   */
  const submitMFA = useCallback(
    (totp: string) => {
      if (handleRef.current) {
        dispatch({ type: 'MFA_VERIFYING' });
        handleRef.current.emit(PasskeyMFAEventEmit.VerifyMFACode, totp);
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
      handleRef.current.emit(PasskeyMFAEventEmit.LostDevice);
    }
  }, [dispatch]);

  /**
   * Submit recovery code for verification
   */
  const submitRecoveryCode = useCallback(
    (recoveryCode: string) => {
      if (handleRef.current) {
        dispatch({ type: 'RECOVERY_CODE_VERIFYING' });
        handleRef.current.emit(PasskeyMFAEventEmit.VerifyRecoveryCode, recoveryCode);
      }
    },
    [dispatch],
  );

  /**
   * Start the passkey registration flow
   * Creates a new passkey for the user
   */
  const startPasskeyRegister = useCallback((username?: string) => {
    isActiveRef.current = true;

    try {
      const extension = getExtensionInstance();
      const registerPromise = extension.registerWithPasskey(username);

      // Registration doesn't have event handlers like login
      // It's a simple promise that resolves with the DID token or null
      registerPromise
        .then(result => {
          if (result) {
            dispatch({ type: 'LOGIN_SUCCESS' });
            handleSuccess({
              method: 'passkey',
              didToken: result.idToken,
              deviceInfo: result.deviceInfo,
            });
          }
        })
        .catch(error => {
          const errorInstance =
            error instanceof Error ? error : new Error(error?.message || 'Passkey registration failed');
          dispatch({ type: 'LOGIN_ERROR', error: errorInstance.message });
          handleError(errorInstance);
        })
        .finally(() => {
          isActiveRef.current = false;
        });
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error('Failed to start passkey registration');
      dispatch({
        type: 'LOGIN_ERROR',
        error: errorInstance.message,
      });
      handleError(errorInstance);
      isActiveRef.current = false;
    }
  }, [dispatch, handleSuccess, handleError]);

  /**
   * Cancel the current login flow
   */
  const cancelLogin = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.emit(PasskeyMFAEventEmit.Cancel);
    }
    handleRef.current = null;
    isActiveRef.current = false;
    dispatch({ type: 'GO_TO_LOGIN' });
  }, [dispatch]);

  const value: PasskeyLoginContextValue = {
    startPasskeyLogin,
    startPasskeyRegister,
    submitMFA,
    lostDevice,
    submitRecoveryCode,
    cancelLogin,
    isPasskeyLoginActive: isActiveRef.current,
  };

  return <PasskeyLoginContext.Provider value={value}>{children}</PasskeyLoginContext.Provider>;
}

/**
 * Hook to access the passkey login context
 * @throws Error if used outside of PasskeyLoginProvider
 */
export function usePasskeyLogin(): PasskeyLoginContextValue {
  const context = useContext(PasskeyLoginContext);
  if (!context) {
    throw new Error('usePasskeyLogin must be used within a PasskeyLoginProvider');
  }
  return context;
}
