import React, { createContext, useContext, useRef, useCallback, useState, ReactNode } from 'react';
import { getExtensionInstance, OAuthRedirectError, OAuthRedirectResult } from '../extension';
import { WidgetAction } from '../reducer';
import { OAuthMFAEventEmit, OAuthMFAEventOnReceived } from '@magic-sdk/types';
import { useWidgetConfig } from './WidgetConfigContext';
import { OAuthProvider } from '../extension';

type OAuthPopupHandle = ReturnType<ReturnType<typeof getExtensionInstance>['loginWithPopup']>;

interface OAuthLoginContextValue {
  startOAuthLogin: (provider: OAuthProvider) => void;
  submitMFA: (totp: string) => void;
  lostDevice: () => void;
  submitRecoveryCode: (recoveryCode: string) => void;
  cancelLogin: () => void;
  isMfaActive: boolean;
}

const OAuthLoginContext = createContext<OAuthLoginContextValue | null>(null);

interface OAuthLoginProviderProps {
  children: ReactNode;
  dispatch: React.Dispatch<WidgetAction>;
}

export function OAuthLoginProvider({ children, dispatch }: OAuthLoginProviderProps) {
  const { handleSuccess, handleError } = useWidgetConfig();

  const handleRef = useRef<OAuthPopupHandle | null>(null);
  const [isMfaActive, setIsMfaActive] = useState(false);

  const startOAuthLogin = useCallback(
    (provider: OAuthProvider) => {
      try {
        // Clean up any previous handle to prevent leaked listeners and stale dispatches
        if (handleRef.current) {
          handleRef.current.removeAllListeners();
          handleRef.current = null;
        }

        const extension = getExtensionInstance();
        const handle = extension.loginWithPopup(provider);
        handleRef.current = handle;

        // MFA Events
        handle.on(OAuthMFAEventOnReceived.MfaSentHandle, () => {
          if (handleRef.current !== handle) return;
          setIsMfaActive(true);
          dispatch({ type: 'MFA_REQUIRED' });
        });

        handle.on(OAuthMFAEventOnReceived.InvalidMfaOtp, () => {
          if (handleRef.current !== handle) return;
          dispatch({ type: 'MFA_INVALID' });
        });

        handle.on(OAuthMFAEventOnReceived.InvalidRecoveryCode, () => {
          if (handleRef.current !== handle) return;
          dispatch({ type: 'RECOVERY_CODE_INVALID' });
        });

        handle.on(OAuthMFAEventOnReceived.RecoveryCodeSentHandle, () => {
          if (handleRef.current !== handle) return;
          dispatch({ type: 'LOST_DEVICE' });
        });

        handle.on(OAuthMFAEventOnReceived.RecoveryCodeSuccess, () => {
          // Recovery code accepted — login will resolve via the promise handler
        });

        // Handle Promise Resolution
        handle
          .then((result: OAuthRedirectResult | OAuthRedirectError) => {
            if (handleRef.current !== handle) return;

            if ((result as OAuthRedirectError).error) {
              const errorResult = result as OAuthRedirectError;
              const errorInstance = new Error(errorResult.error_description || errorResult.error);
              dispatch({ type: 'LOGIN_ERROR', error: errorInstance.message });
              handleError(errorInstance);
              // Clean up handle and listeners
              handle.removeAllListeners();
              handleRef.current = null;
              setIsMfaActive(false);
              return;
            }

            const oauthResult = result as OAuthRedirectResult;
            dispatch({ type: 'LOGIN_SUCCESS' });
            handleSuccess({
              method: 'oauth',
              magic: oauthResult.magic,
              oauth: oauthResult.oauth,
            });
            // Clean up handle and listeners
            handle.removeAllListeners();
            handleRef.current = null;
            setIsMfaActive(false);
          })
          .catch((error: any) => {
            if (handleRef.current !== handle) return;

            const errorInstance = error instanceof Error ? error : new Error(error?.message || 'OAuth login failed');
            const msg = (errorInstance.message || '').toLowerCase();

            // If user closed the popup or denied access, go back to login (not an error)
            if (
              msg.includes('user rejected') ||
              msg.includes('user denied') ||
              msg.includes('access_denied') ||
              msg.includes('user closed') ||
              msg.includes('popup closed') ||
              msg.includes('cancelled') ||
              msg.includes('canceled')
            ) {
              handleRef.current = null;
              setIsMfaActive(false);
              dispatch({ type: 'GO_TO_LOGIN' });
              return;
            }

            dispatch({ type: 'LOGIN_ERROR', error: errorInstance.message });
            handleError(errorInstance);
            // Clean up handle and listeners
            handle.removeAllListeners();
            handleRef.current = null;
            setIsMfaActive(false);
          });
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error('Failed to start OAuth login');
        dispatch({ type: 'LOGIN_ERROR', error: errorInstance.message });
        handleError(errorInstance);
      }
    },
    [dispatch, handleSuccess, handleError, setIsMfaActive],
  );

  const submitMFA = useCallback(
    (totp: string) => {
      if (handleRef.current) {
        dispatch({ type: 'MFA_VERIFYING' });
        handleRef.current.emit(OAuthMFAEventEmit.VerifyMFACode, totp);
      }
    },
    [dispatch],
  );

  const lostDevice = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.emit(OAuthMFAEventEmit.LostDevice);
    }
  }, [dispatch]);

  const submitRecoveryCode = useCallback(
    (recoveryCode: string) => {
      if (handleRef.current) {
        dispatch({ type: 'RECOVERY_CODE_VERIFYING' });
        handleRef.current.emit(OAuthMFAEventEmit.VerifyRecoveryCode, recoveryCode);
      }
    },
    [dispatch],
  );

  const cancelLogin = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.emit(OAuthMFAEventEmit.Cancel);
    }
    handleRef.current = null;
    setIsMfaActive(false);
    dispatch({ type: 'GO_TO_LOGIN' });
  }, [dispatch, setIsMfaActive]);

  const value: OAuthLoginContextValue = {
    startOAuthLogin,
    submitMFA,
    lostDevice,
    submitRecoveryCode,
    cancelLogin,
    isMfaActive,
  };

  return <OAuthLoginContext.Provider value={value}>{children}</OAuthLoginContext.Provider>;
}

export function useOAuthLogin(): OAuthLoginContextValue {
  const context = useContext(OAuthLoginContext);
  if (!context) {
    throw new Error('useOAuthLogin must be used within an OAuthLoginProvider');
  }
  return context;
}
