import { Footer, LoadingSpinner, Modal } from '@magiclabs/ui-components';
import { VStack } from '../styled-system/jsx';
import React, { useEffect, useReducer, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginView } from './views/LoginView';
import { WalletPendingView } from './views/WalletPendingView';
import { widgetReducer, initialState, WidgetAction, WidgetState } from './reducer';
import { MagicWidgetProps, OAuthProvider, ThirdPartyWallet } from './types';
import { wagmiConfig } from './wagmi/config';
import { OAuthPendingView } from './views/OAuthPendingView';
import AdditionalProvidersView from './views/AdditionalProvidersView';
import { getExtensionInstance } from './extension';
import { EmailLoginProvider } from './context/EmailLoginContext';
import { WidgetConfigProvider } from './context/WidgetConfigContext';
import { EmailOTPView } from './views/EmailOTPView';
import { DeviceVerificationView } from './views/DeviceVerificationView';
import { LoginSuccessView } from './views/LoginSuccessView';
import { MFAView } from './views/MfaView';
import { RecoveryCodeView } from './views/RecoveryCode';
import { LostRecoveryCode } from './views/LostRecoveryCode';

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
        return <WalletPendingView provider={state.selectedProvider as ThirdPartyWallet} dispatch={dispatch} />;
      case 'oauth_pending':
        return <OAuthPendingView provider={state.selectedProvider as OAuthProvider} dispatch={dispatch} />;
      case 'additional_providers':
        return <AdditionalProvidersView dispatch={dispatch} />;
      case 'email_otp_pending':
        return <EmailOTPView state={state} dispatch={dispatch} />;
      case 'device_verification':
        return <DeviceVerificationView state={state} dispatch={dispatch} />;
      case 'mfa_pending':
        return <MFAView state={state} dispatch={dispatch} />;
      case 'recovery_code':
        return <RecoveryCodeView state={state} dispatch={dispatch} />;
      case 'lost_recovery_code':
        return <LostRecoveryCode dispatch={dispatch} />;
      case 'login_success':
        return <LoginSuccessView state={state} />;

      // Add more views here as you implement them
      default:
        return <LoginView dispatch={dispatch} />;
    }
  };

  return (
    <EmailLoginProvider dispatch={dispatch}>
      <Modal>
        <VStack alignItems="center" width="full">
          {renderView()}
          <Footer />
        </VStack>
      </Modal>
    </EmailLoginProvider>
  );
}

// Styles for modal mode
const modalBackdropStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backdropFilter: 'blur(0.375rem)',
  WebkitBackdropFilter: 'blur(0.375rem)', // Safari support
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '15vh', // Slightly above center
  zIndex: 9999,
};

const modalContentStyles: React.CSSProperties = {
  position: 'relative',
};

// Main widget component
export function MagicWidget({
  displayMode = 'inline',
  isOpen = true,
  onClose,
  closeOnSuccess = false,
  closeOnClickOutside = false,
  wallets = [],
  onSuccess,
  onError,
}: MagicWidgetProps) {
  const [state, dispatch] = useReducer(widgetReducer, initialState);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    injectCSS();
    getExtensionInstance()
      .fetchConfig()
      .then(() => setIsConfigLoading(false))
      .catch(err => {
        console.error('Failed to fetch config:', err);
        setIsConfigLoading(false); // Still show widget on error
      });
  }, []);

  if (!isOpen) {
    return null;
  }

  const isModal = displayMode === 'modal';

  // Handle backdrop click for closeOnClickOutside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not the content
    if (closeOnClickOutside && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (isConfigLoading) {
    const loadingContent = (
      <Modal>
        <VStack alignItems="center" justifyContent="center" height="300px">
          <LoadingSpinner />
        </VStack>
      </Modal>
    );

    if (isModal) {
      return (
        <div style={modalBackdropStyles} onClick={handleBackdropClick}>
          <div style={modalContentStyles}>{loadingContent}</div>
        </div>
      );
    }

    return loadingContent;
  }

  const widgetContent = (
    <WidgetConfigProvider
      wallets={wallets}
      onSuccess={onSuccess}
      onError={onError}
      onClose={onClose}
      closeOnSuccess={closeOnSuccess}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <div id="magic-widget-container">
            <WidgetContent state={state} dispatch={dispatch} />
          </div>
        </QueryClientProvider>
      </WagmiProvider>
    </WidgetConfigProvider>
  );

  if (isModal) {
    return (
      <div style={modalBackdropStyles} onClick={handleBackdropClick}>
        <div style={modalContentStyles}>{widgetContent}</div>
      </div>
    );
  }

  return widgetContent;
}

// Placeholder - will be replaced with actual CSS at build time
declare const MAGIC_WIDGET_CSS: string;
