import React, { useEffect, useRef, useState } from 'react';
import { getProviderConfig } from '../lib/provider-config';
import { WidgetAction } from '../reducer';
import { OAuthProvider } from '../types';
import { Pending } from '../components/Pending';
import { useOAuthLogin } from '../hooks/useOAuthLogin';
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
  const { performOAuthLogin, isLoading, error: oauthError, isSuccess } = useOAuthLogin();
  const loginAttempted = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loginAttempted.current) {
      loginAttempted.current = true;

      performOAuthLogin(provider as ExtensionOAuthProvider).catch(err => {
        const errorMessage = (err?.message || '').toLowerCase();

        // If user closed the popup or denied access, go back to login (not an error)
        if (
          errorMessage.includes('user rejected') ||
          errorMessage.includes('user denied') ||
          errorMessage.includes('access_denied') ||
          errorMessage.includes('user closed') ||
          errorMessage.includes('popup closed') ||
          errorMessage.includes('cancelled') ||
          errorMessage.includes('canceled')
        ) {
          dispatch({ type: 'GO_TO_LOGIN' });
          return;
        }

        setErrorMessage(err?.message || 'OAuth login failed');
      });
    }
  }, [performOAuthLogin, provider, dispatch]);

  useEffect(() => {
    if (oauthError && loginAttempted.current) {
      const errorMessage = (oauthError.message || '').toLowerCase();
      // Don't show user cancellation as an error
      if (
        !errorMessage.includes('user rejected') &&
        !errorMessage.includes('user denied') &&
        !errorMessage.includes('access_denied') &&
        !errorMessage.includes('cancelled') &&
        !errorMessage.includes('canceled')
      ) {
        setErrorMessage(oauthError.message);
      }
    }
  }, [oauthError]);

  const isPending = !errorMessage && (isLoading || (!isSuccess && !oauthError));

  return (
    <Pending
      onPressBack={() => dispatch({ type: 'GO_TO_LOGIN' })}
      title={title}
      description={description}
      Icon={Icon}
      isPending={isPending}
      errorMessage={errorMessage}
    />
  );
};
