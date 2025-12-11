import { Button, Footer, Header, IcoDismiss, Modal, Text } from '@magiclabs/ui-components';
import { VStack } from '../styled-system/jsx';
import { token } from '../styled-system/tokens';
import React, { useEffect, useReducer } from 'react';
import { LoginView } from './views/LoginView';
import { PendingView } from './views/PendingView';
import { widgetReducer, initialState, WidgetAction, WidgetState } from './reducer';
import { LoginProvider } from './types';

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
        return <PendingView provider={state.selectedProvider as LoginProvider} dispatch={dispatch} />;
      // Add more views here as you implement them:
      // case 'email_input':
      //   return <EmailInputView dispatch={dispatch} />;
      // case 'otp':
      //   return <OtpView dispatch={dispatch} email={state.email} />;
      // case 'success':
      //   return <SuccessView />;
      // case 'error':
      //   return <ErrorView error={state.error} dispatch={dispatch} />;
      default:
        return <LoginView dispatch={dispatch} />;
    }
  };

  return (
    <Modal>
      <VStack alignItems="center" width="full">
        <Header position="relative">
          <Header.Content>
            <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
              Log in or sign up
            </Text>
          </Header.Content>
          <Header.RightAction>
            <Button variant="neutral" size="sm" onPress={() => console.log('Close widget')}>
              <Button.LeadingIcon>
                <IcoDismiss />
              </Button.LeadingIcon>
            </Button>
          </Header.RightAction>
        </Header>
        {renderView()}
        <Footer />
      </VStack>
    </Modal>
  );
}

// Main widget component
export function MagicWidget() {
  const [state, dispatch] = useReducer(widgetReducer, initialState);

  useEffect(() => {
    injectCSS();
  }, []);

  return (
    <div id="magic-widget-container">
      <WidgetContent state={state} dispatch={dispatch} />
    </div>
  );
}

// Placeholder - will be replaced with actual CSS at build time
declare const MAGIC_WIDGET_CSS: string;
