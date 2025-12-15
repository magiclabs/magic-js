import { useCallback, useState } from 'react';
import { useSignMessage } from 'wagmi';
import { getExtensionInstance } from '../extension';

export interface UseSiweLoginResult {
  /** Perform the full SIWE login flow: generate message, sign, and login */
  performSiweLogin: (address: string, chainId?: number) => Promise<string>;
  /** Whether the SIWE flow is currently in progress */
  isLoading: boolean;
  /** Error that occurred during SIWE flow, if any */
  error: Error | null;
  /** Whether the SIWE login completed successfully */
  isSuccess: boolean;
  /** The DID token returned from successful login */
  didToken: string | null;
  /** Whether the extension is available */
  isExtensionAvailable: boolean;
}

export function useSiweLogin(): UseSiweLoginResult {
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [didToken, setDidToken] = useState<string | null>(null);

  // Check if extension is available
  let isExtensionAvailable = false;
  try {
    getExtensionInstance();
    isExtensionAvailable = true;
  } catch {
    isExtensionAvailable = false;
  }

  const performSiweLogin = useCallback(
    async (address: string, chainId?: number): Promise<string> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      setDidToken(null);

      try {
        // Get the extension instance (singleton)
        let extension;
        try {
          extension = getExtensionInstance();
        } catch (e) {
          console.warn(
            '[useSiweLogin] Extension not initialized - skipping SIWE login. Make sure to create Magic instance with MagicWidgetExtension before rendering MagicWidget.',
          );
          // For now, mark as success without SIWE (wallet is still connected)
          setIsSuccess(true);
          setIsLoading(false);
          return 'SIWE_SKIPPED_NO_EXTENSION';
        }

        console.log('[useSiweLogin] Starting SIWE flow for address:', address);

        // Step 1: Generate the SIWE message (this fetches a nonce from Magic backend)
        console.log('[useSiweLogin] Step 1: Generating SIWE message...');
        const message = await extension.generateMessage({
          address,
          chainId: chainId || 1,
        });
        console.log('[useSiweLogin] SIWE message generated');

        // Step 2: Sign the message with the connected wallet
        console.log('[useSiweLogin] Step 2: Requesting signature from wallet...');
        const signature = await signMessageAsync({ message });
        console.log('[useSiweLogin] Signature received');

        // Step 3: Send the signed message to Magic backend for verification
        console.log('[useSiweLogin] Step 3: Sending to Magic backend for verification...');
        const token = await extension.login({ message, signature });
        console.log('[useSiweLogin] SIWE login complete, DID token received');

        setIsSuccess(true);
        setDidToken(token);
        setIsLoading(false);

        return token;
      } catch (err) {
        console.error('[useSiweLogin] Error:', err);
        const errorInstance = err instanceof Error ? err : new Error('SIWE login failed');
        setError(errorInstance);
        setIsLoading(false);
        throw errorInstance;
      }
    },
    [signMessageAsync],
  );

  return {
    performSiweLogin,
    isLoading,
    error,
    isSuccess,
    didToken,
    isExtensionAvailable,
  };
}
