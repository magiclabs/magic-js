import { useCallback, useState } from 'react';
import { getExtensionInstance, OAuthProvider, OAuthRedirectResult } from '../extension';
import { useWidgetConfig } from '../context/WidgetConfigContext';

export interface UseOAuthLoginResult {
  performOAuthLogin: (provider: OAuthProvider) => Promise<OAuthRedirectResult>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  result: OAuthRedirectResult | null;
}

export function useOAuthLogin(): UseOAuthLoginResult {
  const { handleSuccess, handleError } = useWidgetConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [result, setResult] = useState<OAuthRedirectResult | null>(null);

  const performOAuthLogin = useCallback(
    async (provider: OAuthProvider): Promise<OAuthRedirectResult> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      setResult(null);

      try {
        const extension = getExtensionInstance();
        const oauthResult = await extension.loginWithPopup(provider);

        setIsSuccess(true);
        setResult(oauthResult);
        setIsLoading(false);
        handleSuccess({
          method: 'oauth',
          didToken: oauthResult.magic.idToken,
          oauth: {
            provider: oauthResult.oauth.provider,
            name: oauthResult.oauth.userInfo.name,
            email: oauthResult.oauth.userInfo.email,
            picture: oauthResult.oauth.userInfo.picture,
          },
        });

        return oauthResult;
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('OAuth login failed');
        setError(errorInstance);
        setIsLoading(false);
        handleError(errorInstance);
        throw errorInstance;
      }
    },
    [handleSuccess, handleError],
  );

  return {
    performOAuthLogin,
    isLoading,
    error,
    isSuccess,
    result,
  };
}
