import { Button, Footer, Header, IcoDismiss, Modal, Text } from '@magiclabs/ui-components';
import { VStack } from '../styled-system/jsx';
import { token } from '../styled-system/tokens';
import React, { useEffect, useReducer } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginView } from './views/LoginView';
import { PendingView } from './views/PendingView';
import { widgetReducer, initialState, WidgetAction, WidgetState } from './reducer';
import { ThirdPartyWallets } from './types';
import { wagmiConfig } from './wagmi/config';
import WidgetHeader from './components/WidgetHeader';

// Create a query client for react-query
const queryClient = new QueryClient();

// Inject CSS into document head (only once)
let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;

  const styleElement = document.createElement('style');
  styleElement.id = 'magic-widget-styles';
  styleElement.textContent = MAGIC_WIDGET_CSS;
  document.head.appendChild(styleElement);
  cssInjected = true;
}

// The actual widget content
function WidgetContent({ state, dispatch }: { state: WidgetState; dispatch: React.Dispatch<WidgetAction> }) {
  // Render the current view
  const renderView = () => {
    switch (state.view) {
      case 'login':
        return <LoginView dispatch={dispatch} />;
      case 'wallet_pending':
        return <PendingView provider={state.selectedProvider as ThirdPartyWallets} dispatch={dispatch} />;
      // Add more views here as you implement them:
      // case 'email_input':
      //   return <EmailInputView dispatch={dispatch} />;
      // case 'otp':
      //   return <OtpView dispatch={dispatch} email={state.email} />;
      // case 'error':
      //   return <ErrorView error={state.error} dispatch={dispatch} />;
      default:
        return <LoginView dispatch={dispatch} />;
    }
  };

  return (
    <Modal>
      <VStack alignItems="center" width="full">
        {renderView()}
        <Footer />
      </VStack>
    </Modal>
  );
}

// Main widget component - no props needed, everything is internal
export function MagicWidget() {
  const [state, dispatch] = useReducer(widgetReducer, initialState);

  useEffect(() => {
    injectCSS();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div id="magic-widget-container">
          <WidgetContent state={state} dispatch={dispatch} />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Placeholder - will be replaced with actual CSS at build time
declare const MAGIC_WIDGET_CSS: string;
