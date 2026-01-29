import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { LoginResult, MagicWidgetProps, ThirdPartyWallet } from '../types';

interface WidgetConfigContextValue {
  /** Third-party wallets to display */
  wallets: ThirdPartyWallet[];
  /** Call when login succeeds */
  handleSuccess: (result: LoginResult) => void;
  /** Call when login fails */
  handleError: (error: Error) => void;
  /** Call to close the widget. Undefined if onClose prop wasn't provided. */
  handleClose?: () => void;
}

const WidgetConfigContext = createContext<WidgetConfigContextValue | null>(null);

interface WidgetConfigProviderProps extends MagicWidgetProps {
  children: ReactNode;
}

export function WidgetConfigProvider({
  children,
  wallets = [],
  onSuccess,
  onError,
  onClose,
  closeOnSuccess = false,
}: WidgetConfigProviderProps) {
  const handleSuccess = useCallback(
    (result: LoginResult) => {
      onSuccess?.(result);
      if (closeOnSuccess && onClose) {
        // Delay closing so users can see the success screen
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    },
    [onSuccess, closeOnSuccess, onClose],
  );

  const handleError = useCallback(
    (error: Error) => {
      onError?.(error);
    },
    [onError],
  );

  const handleClose = onClose
    ? () => {
        onClose();
      }
    : undefined;

  const value: WidgetConfigContextValue = {
    wallets,
    handleSuccess,
    handleError,
    handleClose,
  };

  return <WidgetConfigContext.Provider value={value}>{children}</WidgetConfigContext.Provider>;
}

/**
 * Hook to access the widget configuration
 * @throws Error if used outside of WidgetConfigProvider
 */
export function useWidgetConfig(): WidgetConfigContextValue {
  const context = useContext(WidgetConfigContext);
  if (!context) {
    throw new Error('useWidgetConfig must be used within a WidgetConfigProvider');
  }
  return context;
}
