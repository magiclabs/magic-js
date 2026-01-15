import React, { createContext, useContext, ReactNode } from 'react';
import { MagicWidgetProps, ThirdPartyWallets } from '../types';

interface WidgetConfigContextValue {
  /** Third-party wallets to display */
  wallets: ThirdPartyWallets[];
}

const WidgetConfigContext = createContext<WidgetConfigContextValue | null>(null);

interface WidgetConfigProviderProps extends MagicWidgetProps {
  children: ReactNode;
}

export function WidgetConfigProvider({ children, wallets = [] }: WidgetConfigProviderProps) {
  const value: WidgetConfigContextValue = {
    wallets,
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
