import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { getExtensionInstance } from '../extension';
import { WidgetAction } from '../reducer';
import { useWidgetConfig } from './WidgetConfigContext';

type WebAuthnHandle = ReturnType<ReturnType<typeof getExtensionInstance>['loginWithWebAuthn']>;

interface WebAuthnLoginContextValue {
  startWebAuthnLogin: (username: string) => void;
  registerNewWebAuthnUser: (username: string, nickname?: string) => void;
  cancelLogin: () => void;
  username: string | null;
}

const WebAuthnLoginContext = createContext<WebAuthnLoginContextValue | null>(null);

interface WebAuthnLoginProviderProps {
  children: ReactNode;
  dispatch: React.Dispatch<WidgetAction>;
}

export function WebAuthnLoginProvider({ children, dispatch }: WebAuthnLoginProviderProps) {
  const { handleSuccess, handleError } = useWidgetConfig();

  const handleRef = useRef<WebAuthnHandle | null>(null);
  const usernameRef = useRef<string | null>(null);

  /**
   * Start the WebAuthn login flow
   * Initiates WebAuthn biometric authentication for the given username
   */
  const startWebAuthnLogin = useCallback(
    (username: string) => {
      usernameRef.current = username;
      dispatch({ type: 'OTP_START', identifier: username, loginMethod: 'webauthn' });

      try {
        const extension = getExtensionInstance();
        const handle = extension.loginWithWebAuthn(username);
        handleRef.current = handle;

        // Handle Promise Resolution
        handle
          .then((didToken: string | null) => {
            if (didToken) {
              dispatch({ type: 'LOGIN_SUCCESS' });
              handleSuccess({ method: 'webauthn', didToken });
            }
          })
          .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            const errorInstance = error instanceof Error ? error : new Error(errorMessage);
            dispatch({ type: 'LOGIN_ERROR', error: errorMessage });
            handleError(errorInstance);
          });
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error('Failed to start WebAuthn login');
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
   * Register a new user with WebAuthn (passkey)
   * Creates a new WebAuthn credential for the user
   */
  const registerNewWebAuthnUser = useCallback(
    (username: string, nickname?: string) => {
      usernameRef.current = username;
      dispatch({ type: 'OTP_START', identifier: username, loginMethod: 'webauthn' });

      try {
        const extension = getExtensionInstance();
        const handle = extension.registerNewWebAuthnUser({ username, nickname });
        handleRef.current = handle;

        // Handle Promise Resolution
        handle
          .then((didToken: string | null) => {
            if (didToken) {
              dispatch({ type: 'LOGIN_SUCCESS' });
              handleSuccess({ method: 'webauthn', didToken });
            }
          })
          .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            const errorInstance = error instanceof Error ? error : new Error(errorMessage);
            dispatch({ type: 'LOGIN_ERROR', error: errorMessage });
            handleError(errorInstance);
          });
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error('Failed to start WebAuthn registration');
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
   * Cancel the current login flow
   */
  const cancelLogin = useCallback(() => {
    handleRef.current = null;
    usernameRef.current = null;
    dispatch({ type: 'GO_TO_LOGIN' });
  }, [dispatch]);

  const value: WebAuthnLoginContextValue = {
    startWebAuthnLogin,
    registerNewWebAuthnUser,
    cancelLogin,
    username: usernameRef.current,
  };

  return <WebAuthnLoginContext.Provider value={value}>{children}</WebAuthnLoginContext.Provider>;
}

/**
 * Hook to access the WebAuthn login context
 * @throws Error if used outside of WebAuthnLoginProvider
 */
export function useWebAuthnLogin(): WebAuthnLoginContextValue {
  const context = useContext(WebAuthnLoginContext);
  if (!context) {
    throw new Error('useWebAuthnLogin must be used within a WebAuthnLoginProvider');
  }
  return context;
}
