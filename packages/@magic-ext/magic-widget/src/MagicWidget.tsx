import { Footer, LoadingSpinner, Modal, useCustomVars } from '@magiclabs/ui-components';
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
import { WalletConnectView } from './views/WalletConnectView';
import { ClientTheme } from './types/client-config';

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
        return <WalletPendingView provider={state.selectedProvider as ThirdPartyWallet} state={state} dispatch={dispatch} />;
      case 'walletconnect_pending':
        return <WalletConnectView dispatch={dispatch} />;
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
      <Modal removeTopOffset>
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
  onReady,
}: MagicWidgetProps) {
  const [state, dispatch] = useReducer(widgetReducer, initialState);
  // Check if config is already cached to avoid unnecessary loading state
  const [isConfigLoading, setIsConfigLoading] = useState(() => {
    return getExtensionInstance().getConfig() === null;
  });
  const { setColors, setRadius } = useCustomVars({});
  const [clientTheme, setClientTheme] = useState<ClientTheme | null>(null);

  useEffect(() => {
    injectCSS();
    // Only fetch if not already cached
    if (isConfigLoading) {
      getExtensionInstance()
        .fetchConfig()
        .then(clientConfig => {
          setClientTheme(clientConfig.theme);
          setIsConfigLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch config:', err);
          setIsConfigLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (!clientTheme) return;

    const setClientTheme = async () => {
      try {
        const colorMode = clientTheme.themeColor === 'dark' ? 'dark' : 'light';
        const { textColor, buttonColor, buttonRadius, containerRadius, backgroundColor, neutralColor } = clientTheme;
        document.documentElement.setAttribute('data-color-mode', colorMode);
        if (textColor) setColors('text', textColor);
        if (buttonRadius) setRadius('button', buttonRadius);
        if (containerRadius) setRadius('container', containerRadius);
        if (backgroundColor) setColors('surface', backgroundColor);
        if (neutralColor) setColors('neutral', neutralColor);
        if (buttonColor) setColors('brand', buttonColor);
        onReady?.();
      } catch (e) {
        console.error('Error setting client theme', e);
      }
    };

    setClientTheme();
  }, [clientTheme]);

  // Reset to login view when modal is opened
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: 'GO_TO_LOGIN' });
    }
  }, [isOpen]);

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

  if (isConfigLoading) return null;

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
