import { useCallback, useState } from 'react';
import { useSignMessage, useChainId } from 'wagmi';
import { getExtensionInstance } from '../extension';
import { useWidgetConfig } from '../context/WidgetConfigContext';
import { getWalletConnectProvider } from '../wagmi/walletconnect-provider';

export interface UseSiweLoginResult {
  performSiweLogin: (address: string, chainId?: number) => Promise<string>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  walletAddress: string | null;
}

export function useSiweLogin(): UseSiweLoginResult {
  const { signMessageAsync } = useSignMessage();
  const connectedChainId = useChainId();
  const { handleSuccess, handleError } = useWidgetConfig();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const performSiweLogin = useCallback(
    async (address: string, chainId?: number): Promise<string> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      setWalletAddress(null);

      try {
        const extension = getExtensionInstance();
        const effectiveChainId = chainId || connectedChainId || 1;

        // Step 1: Generate the SIWE message (this fetches a nonce from Magic backend)
        const message = await extension.generateMessage({
          address,
          chainId: effectiveChainId,
        });

        // Step 2: Sign the message with the connected wallet
        // Use WalletConnect provider if available, otherwise use wagmi's signMessageAsync
        let signature: string;
        const wcProvider = getWalletConnectProvider();
        if (wcProvider && wcProvider.accounts && wcProvider.accounts[0]?.toLowerCase() === address.toLowerCase()) {
          // Use WalletConnect provider for signing
          signature = await wcProvider.request({
            method: 'personal_sign',
            params: [message, address],
          });
        } else {
          // Use wagmi's signMessageAsync (for other wallets)
          signature = await signMessageAsync({ message });
        }

        // Step 3: Send the signed message to Magic backend for verification
        await extension.login({ message, signature });

        // Step 4: Set up the connected state for 3rd party wallet RPC routing
        // This enables signing requests to be routed through the connected wallet
        extension.setConnectedState(address, effectiveChainId);

        setIsSuccess(true);
        setWalletAddress(address);
        setIsLoading(false);
        handleSuccess({ method: 'wallet', walletAddress: address });

        return address;
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('SIWE login failed');
        setError(errorInstance);
        setIsLoading(false);
        handleError(errorInstance);
        throw errorInstance;
      }
    },
    [signMessageAsync, connectedChainId, handleSuccess, handleError],
  );

  return {
    performSiweLogin,
    isLoading,
    error,
    isSuccess,
    walletAddress,
  };
}
