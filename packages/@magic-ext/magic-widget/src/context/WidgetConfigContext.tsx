import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { LoginResult, MagicWidgetProps, ThirdPartyWallet } from '../types';

interface WidgetConfigContextValue {
  /** Third-party wallets to display */
  wallets: ThirdPartyWallet[];
  /** Call when login succeeds */
  handleSuccess: (result: LoginResult) => void;
  /** Call when login fails */
  handleError: (error: Error) => void;
}

const WidgetConfigContext = createContext<WidgetConfigContextValue | null>(null);

interface WidgetConfigProviderProps extends MagicWidgetProps {
  children: ReactNode;
}

export function WidgetConfigProvider({ children, wallets = [], onSuccess, onError }: WidgetConfigProviderProps) {
  const handleSuccess = useCallback(
    (result: LoginResult) => {
      onSuccess?.(result);
    },
    [onSuccess],
  );

  const handleError = useCallback(
    (error: Error) => {
      onError?.(error);
    },
    [onError],
  );

  const value: WidgetConfigContextValue = {
    wallets,
    handleSuccess,
    handleError,
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
