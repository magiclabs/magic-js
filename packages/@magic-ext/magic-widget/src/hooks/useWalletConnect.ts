import { useCallback, useState } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { ThirdPartyWallets } from '../types';
import { CONNECTOR_IDS, CONNECTOR_NAME_PATTERNS } from '../wagmi/connectors';

export interface UseWalletConnectResult {
  connectWallet: () => Promise<void>;
  isPending: boolean;
  error: Error | null;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  disconnect: () => void;
}

export function useWalletConnect(provider: ThirdPartyWallets): UseWalletConnectResult {
  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<Error | null>(null);

  const connectWallet = useCallback(async () => {
    setError(null);

    // If already connected, no need to connect again
    if (isConnected && address) {
      return;
    }

    try {
      const connectorId = CONNECTOR_IDS[provider];
      const namePattern = CONNECTOR_NAME_PATTERNS[provider];

      // Find connector by ID or by name pattern
      const connector = connectors.find(
        c => c.id === connectorId || c.name.toLowerCase().includes(namePattern),
      );

      if (!connector) {
        throw new Error(`${provider} connector not found. Please install the wallet extension.`);
      }

      // Connect to the wallet
      await new Promise<void>((resolve, reject) => {
        connect(
          { connector },
          {
            onSuccess: () => resolve(),
            onError: err => reject(err),
          },
        );
      });
    } catch (err) {
      console.error(`${provider} connection error:`, err);
      const errorMessage = err instanceof Error ? err : new Error(`Failed to connect to ${provider}`);
      setError(errorMessage);
      throw errorMessage;
    }
  }, [connect, connectors, provider, isConnected, address]);

  return {
    connectWallet,
    isPending,
    error,
    address,
    isConnected,
    disconnect,
  };
}

