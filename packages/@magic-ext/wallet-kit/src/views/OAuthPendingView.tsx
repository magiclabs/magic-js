import React, { useEffect, useRef } from 'react';
import { getProviderConfig } from '../lib/provider-config';
import { WidgetAction, WidgetState } from '../reducer';
import { OAuthProvider } from '../types';
import { Pending } from '../components/Pending';
import { useOAuthLogin } from '../context/OAuthLoginContext';
import { OAuthProvider as ExtensionOAuthProvider, getExtensionInstance } from '../extension';
import { DARK_MODE_ICON_OVERRIDES } from '../constants';

interface OAuthPendingViewProps {
  provider: OAuthProvider;
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const OAuthPendingView = ({ provider, state, dispatch }: OAuthPendingViewProps) => {
  const { title, description, Icon: DefaultIcon } = getProviderConfig(provider);
  const config = getExtensionInstance().getConfig();
  const isDarkMode = config?.theme.themeColor === 'dark';
  const Icon = (isDarkMode && DARK_MODE_ICON_OVERRIDES[provider]) || DefaultIcon;
  const { startOAuthLogin } = useOAuthLogin();
  const loginAttempted = useRef(false);
  const hasError = state.emailLoginStatus === 'error';
  const errorMessage = state.error ?? null;

  useEffect(() => {
    if (!loginAttempted.current) {
      loginAttempted.current = true;
      startOAuthLogin(provider as ExtensionOAuthProvider);
    }
  }, [startOAuthLogin, provider]);

  return (
    <Pending
      onPressBack={() => dispatch({ type: 'GO_TO_LOGIN' })}
      title={title}
      description={description}
      Icon={Icon}
      isPending={!hasError}
      errorMessage={hasError ? errorMessage : null}
    />
  );
};
