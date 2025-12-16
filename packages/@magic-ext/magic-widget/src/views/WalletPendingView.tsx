import React, { useEffect, useState } from 'react';
import { getProviderConfig } from '../lib/provider-config';
import { WidgetAction } from '../reducer';
import { ThirdPartyWallets } from '../types';
import { useWalletConnect } from '../hooks/useWalletConnect';
import { useSiweLogin } from '../hooks/useSiweLogin';
import { Pending } from 'src/components/Pending';

interface WalletPendingViewProps {
  provider: ThirdPartyWallets;
  dispatch: React.Dispatch<WidgetAction>;
}

export const WalletPendingView = ({ provider, dispatch }: WalletPendingViewProps) => {
  const {
    connectWallet,
    isPending: isWalletPending,
    error: walletError,
    address,
    isConnected,
    isConnectedToSelectedProvider,
  } = useWalletConnect(provider);
  const { performSiweLogin, isLoading: isSiweLoading, error: siweError, isSuccess: isSiweSuccess } = useSiweLogin();
  const { title, description, Icon } = getProviderConfig(provider);

  // Track whether we've attempted connection and SIWE
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  // Track which address we've attempted SIWE for (to handle reconnections)
  const [siweAttemptedForAddress, setSiweAttemptedForAddress] = useState<string | null>(null);
  // Local error state to display on this view instead of navigating away
  const [localError, setLocalError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('[PendingView] State:', {
      isConnected,
      isConnectedToSelectedProvider,
      address,
      isWalletPending,
      connectionAttempted,
      siweAttemptedForAddress,
      isSiweLoading,
      isSiweSuccess,
      walletError: walletError?.message,
      siweError: siweError?.message,
    });
  }, [
    isConnected,
    isConnectedToSelectedProvider,
    address,
    isWalletPending,
    connectionAttempted,
    siweAttemptedForAddress,
    isSiweLoading,
    isSiweSuccess,
    walletError,
    siweError,
  ]);

  // Initiate wallet connection on mount (only if not already connected to the SELECTED provider)
  useEffect(() => {
    if (!connectionAttempted) {
      setConnectionAttempted(true);

      // Only skip wallet connection if already connected to the SAME wallet type
      // If connected to a different wallet, we need to switch
      if (isConnectedToSelectedProvider && address) {
        console.log(
          '[PendingView] Already connected to',
          provider,
          'with address:',
          address,
          '- skipping wallet connection',
        );
        return;
      }

      console.log('[PendingView] Not connected to', provider, '- attempting wallet connection...');
      connectWallet().catch(err => {
        const errorMessage = (err?.message || '').toLowerCase();

        // Ignore transient "Connector not connected" errors - these happen during disconnect/reconnect
        if (errorMessage.includes('connector not connected') || errorMessage.includes('connectornotconnectederror')) {
          console.log('[PendingView] Ignoring transient connector error during reconnection');
          return;
        }

        // If user rejected/denied the connection, go back to login (not an error)
        if (
          errorMessage.includes('user rejected') ||
          errorMessage.includes('user denied') ||
          errorMessage.includes('rejected the request') ||
          errorMessage.includes('user cancelled') ||
          errorMessage.includes('user canceled')
        ) {
          console.log('[PendingView] User rejected connection, returning to login');
          dispatch({ type: 'GO_TO_LOGIN' });
          return;
        }

        console.error('[PendingView] Wallet connection error:', err);
        setLocalError(err?.message || 'Failed to connect wallet');
      });
    }
  }, [connectionAttempted, connectWallet, isConnectedToSelectedProvider, address, provider]);

  // Once wallet is connected to the SELECTED provider with a stable address, initiate SIWE login
  // Only attempt SIWE if:
  // 1. We're connected to the selected provider with an address
  // 2. We haven't already attempted SIWE for this specific address
  // 3. We're not currently in a loading state (prevents double-calls during reconnection)
  useEffect(() => {
    if (isConnectedToSelectedProvider && address && siweAttemptedForAddress !== address && !isSiweLoading) {
      setSiweAttemptedForAddress(address);
      setLocalError(null); // Clear any previous errors
      console.log('[PendingView] Connected to', provider, '- starting SIWE login for address:', address);
      performSiweLogin(address).catch(err => {
        const errorMessage = (err?.message || '').toLowerCase();

        // Ignore transient "Connector not connected" errors
        if (errorMessage.includes('connector not connected') || errorMessage.includes('connectornotconnectederror')) {
          console.log('[PendingView] Ignoring transient connector error during SIWE');
          return;
        }

        // If user rejected/denied the signature, go back to login (not an error)
        if (
          errorMessage.includes('user rejected') ||
          errorMessage.includes('user denied') ||
          errorMessage.includes('rejected the request') ||
          errorMessage.includes('user cancelled') ||
          errorMessage.includes('user canceled')
        ) {
          console.log('[PendingView] User rejected signature, returning to login');
          dispatch({ type: 'GO_TO_LOGIN' });
          return;
        }

        console.error('[PendingView] SIWE login error:', err);
        setLocalError(err?.message || 'SIWE login failed');
      });
    }
  }, [isConnectedToSelectedProvider, address, siweAttemptedForAddress, isSiweLoading, performSiweLogin, provider]);

  // Update local error from hook errors
  useEffect(() => {
    if (walletError && connectionAttempted) {
      setLocalError(walletError.message);
    }
  }, [walletError, connectionAttempted]);

  useEffect(() => {
    if (siweError && siweAttemptedForAddress) {
      setLocalError(siweError.message);
    }
  }, [siweError, siweAttemptedForAddress]);

  // Show spinner until SIWE is complete or there's an error
  const isPending = !localError && (isWalletPending || isSiweLoading || (!isSiweSuccess && !walletError && !siweError));

  return (
    <Pending
      onPressBack={() => dispatch({ type: 'GO_TO_LOGIN' })}
      title={title}
      description={description}
      Icon={Icon}
      isPending={isPending}
      errorMessage={localError}
    />
  );
};
