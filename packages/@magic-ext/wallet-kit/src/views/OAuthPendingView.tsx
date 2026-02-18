import React, { useEffect, useRef, useState } from 'react';
import { getProviderConfig } from '../lib/provider-config';
import { WidgetAction } from '../reducer';
import { OAuthProvider } from '../types';
import { Pending } from '../components/Pending';
import { useOAuthLogin } from '../context/OAuthLoginContext';
import { OAuthProvider as ExtensionOAuthProvider, getExtensionInstance } from '../extension';
import { DARK_MODE_ICON_OVERRIDES } from '../constants';

interface OAuthPendingViewProps {
  provider: OAuthProvider;
  dispatch: React.Dispatch<WidgetAction>;
}

export const OAuthPendingView = ({ provider, dispatch }: OAuthPendingViewProps) => {
  const { title, description, Icon: DefaultIcon } = getProviderConfig(provider);
  const config = getExtensionInstance().getConfig();
  const isDarkMode = config?.theme.themeColor === 'dark';
  const Icon = (isDarkMode && DARK_MODE_ICON_OVERRIDES[provider]) || DefaultIcon;
  const { startOAuthLogin } = useOAuthLogin();
  const loginAttempted = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    if (!loginAttempted.current) {
      loginAttempted.current = true;

      try {
        startOAuthLogin(provider as ExtensionOAuthProvider);
      } catch (err: any) {
        setErrorMessage(err?.message || 'OAuth login failed');
        setIsPending(false);
      }
    }
  }, [startOAuthLogin, provider]);

  return (
    <Pending
      onPressBack={() => dispatch({ type: 'GO_TO_LOGIN' })}
      title={title}
      description={description}
      Icon={Icon}
      isPending={isPending && !errorMessage}
      errorMessage={errorMessage}
    />
  );
};
