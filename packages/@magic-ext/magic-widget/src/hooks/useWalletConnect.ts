import { useCallback, useState, useMemo } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { ThirdPartyWallets } from '../types';
import { CONNECTOR_IDS, CONNECTOR_NAME_PATTERNS } from '../wagmi/connectors';

export interface UseWalletConnectResult {
  connectWallet: () => Promise<void>;
  isPending: boolean;
  error: Error | null;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  /** Whether the currently connected wallet matches the selected provider */
  isConnectedToSelectedProvider: boolean;
  disconnect: () => void;
}

export function useWalletConnect(provider: ThirdPartyWallets): UseWalletConnectResult {
  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected, connector: activeConnector } = useAccount();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<Error | null>(null);

  // Check if the currently connected wallet matches the selected provider
  const isConnectedToSelectedProvider = useMemo(() => {
    if (!isConnected || !activeConnector) return false;

    const connectorId = CONNECTOR_IDS[provider];
    const namePattern = CONNECTOR_NAME_PATTERNS[provider];
    const connectorName = activeConnector.name.toLowerCase();

    // Check if active connector matches the selected provider
    const matchesId = activeConnector.id === connectorId;
    const matchesName = connectorName === namePattern || connectorName.startsWith(namePattern);

    return matchesId || matchesName;
  }, [isConnected, activeConnector, provider]);

  const connectWallet = useCallback(async () => {
    setError(null);

    try {
      const connectorId = CONNECTOR_IDS[provider];
      const namePattern = CONNECTOR_NAME_PATTERNS[provider];

      // Find connector - be more specific about matching
      // First try exact ID match
      const connectorById = connectors.find(c => c.id === connectorId);

      // If no exact ID match, try name pattern (but be strict - must start with or equal the pattern)
      const connectorByName = connectors.find(c => {
        const nameLower = c.name.toLowerCase();
        return nameLower === namePattern || nameLower.startsWith(namePattern);
      });

      const foundConnector = connectorById || connectorByName;

      if (!foundConnector) {
        throw new Error(`${provider} connector not found. Please install the wallet extension.`);
      }

      // If already connected to a different wallet, disconnect first
      if (isConnected) {
        disconnect();
        // Small delay to ensure disconnect completes
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Connect to the wallet
      await new Promise<void>((resolve, reject) => {
        connect(
          { connector: foundConnector },
          {
            onSuccess: () => resolve(),
            onError: err => reject(err),
          },
        );
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error(`Failed to connect to ${provider}`);
      setError(errorMessage);
      throw errorMessage;
    }
  }, [connect, connectors, provider, isConnected, disconnect]);

  return {
    connectWallet,
    isPending,
    error,
    address,
    isConnected,
    isConnectedToSelectedProvider,
    disconnect,
  };
}
