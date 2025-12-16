import { useCallback, useState } from 'react';
import { getExtensionInstance, OAuthProvider, OAuthRedirectResult } from '../extension';

export interface UseOAuthLoginResult {
  /** Perform the OAuth login flow via popup */
  performOAuthLogin: (provider: OAuthProvider) => Promise<OAuthRedirectResult>;
  /** Whether the OAuth flow is currently in progress */
  isLoading: boolean;
  /** Error that occurred during OAuth flow, if any */
  error: Error | null;
  /** Whether the OAuth login completed successfully */
  isSuccess: boolean;
  /** The result from successful OAuth login */
  result: OAuthRedirectResult | null;
  /** Whether the extension is available */
  isExtensionAvailable: boolean;
}

export function useOAuthLogin(): UseOAuthLoginResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [result, setResult] = useState<OAuthRedirectResult | null>(null);

  // Check if extension is available
  let isExtensionAvailable = false;
  try {
    getExtensionInstance();
    isExtensionAvailable = true;
  } catch {
    isExtensionAvailable = false;
  }

  const performOAuthLogin = useCallback(async (provider: OAuthProvider): Promise<OAuthRedirectResult> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setResult(null);

    try {
      // Get the extension instance (singleton)
      let extension;
      try {
        extension = getExtensionInstance();
      } catch (e) {
        console.warn(
          '[useOAuthLogin] Extension not initialized. Make sure to create Magic instance with MagicWidgetExtension before rendering MagicWidget.',
        );
        throw new Error('MagicWidgetExtension not initialized');
      }

      console.log('[useOAuthLogin] Starting OAuth flow for provider:', provider);

      // Trigger the OAuth popup flow
      const oauthResult = await extension.loginWithPopup(provider);
      console.log('[useOAuthLogin] OAuth login complete');

      setIsSuccess(true);
      setResult(oauthResult);
      setIsLoading(false);

      return oauthResult;
    } catch (err) {
      console.error('[useOAuthLogin] Error:', err);
      const errorInstance = err instanceof Error ? err : new Error('OAuth login failed');
      setError(errorInstance);
      setIsLoading(false);
      throw errorInstance;
    }
  }, []);

  return {
    performOAuthLogin,
    isLoading,
    error,
    isSuccess,
    result,
    isExtensionAvailable,
  };
}
