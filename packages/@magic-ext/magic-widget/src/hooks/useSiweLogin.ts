import { useCallback, useState } from 'react';
import { useSignMessage } from 'wagmi';
import { getExtensionInstance } from '../extension';

export interface UseSiweLoginResult {
  performSiweLogin: (address: string, chainId?: number) => Promise<string>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  publicAddress: string | null;
}

export function useSiweLogin(): UseSiweLoginResult {
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [publicAddress, setPublicAddress] = useState<string | null>(null);

  const performSiweLogin = useCallback(
    async (address: string, chainId?: number): Promise<string> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      setPublicAddress(null);

      try {
        const extension = getExtensionInstance();

        // Step 1: Generate the SIWE message (this fetches a nonce from Magic backend)
        const message = await extension.generateMessage({
          address,
          chainId: chainId || 1,
        });

        // Step 2: Sign the message with the connected wallet
        const signature = await signMessageAsync({ message });

        // Step 3: Send the signed message to Magic backend for verification
        const publicAddress = await extension.login({ message, signature });

        setIsSuccess(true);
        setPublicAddress(publicAddress);
        setIsLoading(false);

        return publicAddress;
      } catch (err) {
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
    publicAddress,
  };
}
