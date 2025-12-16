import React, { useEffect, useState } from 'react';
import { getProviderConfig } from '../lib/provider-config';
import { WidgetAction } from '../reducer';
import { OAuthProvider } from '../types';
import { Pending } from '../components/Pending';
import { useOAuthLogin } from '../hooks/useOAuthLogin';
import { OAuthProvider as ExtensionOAuthProvider } from '../extension';

interface OAuthPendingViewProps {
  provider: OAuthProvider;
  dispatch: React.Dispatch<WidgetAction>;
}

export const OAuthPendingView = ({ provider, dispatch }: OAuthPendingViewProps) => {
  const { title, description, Icon } = getProviderConfig(provider);
  const { performOAuthLogin, isLoading, error: oauthError, isSuccess } = useOAuthLogin();

  // Track whether we've attempted OAuth login
  const [loginAttempted, setLoginAttempted] = useState(false);
  // Local error state to display on this view
  const [localError, setLocalError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('[OAuthPendingView] State:', {
      provider,
      isLoading,
      isSuccess,
      loginAttempted,
      oauthError: oauthError?.message,
      localError,
    });
  }, [provider, isLoading, isSuccess, loginAttempted, oauthError, localError]);

  // Trigger OAuth login on mount
  useEffect(() => {
    if (!loginAttempted) {
      setLoginAttempted(true);
      console.log('[OAuthPendingView] Triggering OAuth popup for provider:', provider);

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
          console.log('[OAuthPendingView] User cancelled OAuth, returning to login');
          dispatch({ type: 'GO_TO_LOGIN' });
          return;
        }

        console.error('[OAuthPendingView] OAuth error:', err);
        setLocalError(err?.message || 'OAuth login failed');
      });
    }
  }, [loginAttempted, performOAuthLogin, provider, dispatch]);

  // Update local error from hook errors
  useEffect(() => {
    if (oauthError && loginAttempted) {
      const errorMessage = (oauthError.message || '').toLowerCase();
      // Don't show user cancellation as an error
      if (
        !errorMessage.includes('user rejected') &&
        !errorMessage.includes('user denied') &&
        !errorMessage.includes('access_denied') &&
        !errorMessage.includes('cancelled') &&
        !errorMessage.includes('canceled')
      ) {
        setLocalError(oauthError.message);
      }
    }
  }, [oauthError, loginAttempted]);

  // Show spinner until OAuth is complete or there's an error
  const isPending = !localError && (isLoading || (!isSuccess && !oauthError));

  return (
    <Pending
      onPressBack={() => dispatch({ type: 'GO_TO_LOGIN' })}
      title={title}
      description={localError ? localError : isSuccess ? 'Success!' : description}
      Icon={Icon}
      isPending={isPending}
      errorMessage={localError}
    />
  );
};
