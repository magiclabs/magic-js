import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { getProviderConfig } from '../lib/provider-config';
import { WidgetAction, WidgetState } from '../reducer';
import { ThirdPartyWallet, ThirdPartyWallets } from '../types';
import { useWalletConnect } from '../hooks/useWalletConnect';
import { useSiweLogin } from '../hooks/useSiweLogin';
import { getWalletConnectProvider } from '../wagmi/walletconnect-provider';
import { Pending } from 'src/components/Pending';

interface WalletPendingViewProps {
  provider: ThirdPartyWallet;
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const WalletPendingView = ({ provider, state, dispatch }: WalletPendingViewProps) => {
  // Only proceed if we're actually in the wallet_pending view
  if (state.view !== 'wallet_pending') {
    return null;
  }
  const {
    connectWallet,
    isPending: isWalletPending,
    error: walletError,
    address: wagmiAddress,
    isConnectedToSelectedProvider,
  } = useWalletConnect(provider);
  const { isConnected } = useAccount();

  // For WalletConnect, use the stored address from state (from EthereumProvider or AppKit)
  // For other wallets, use the address from wagmi connector
  const isWalletConnect = provider === ThirdPartyWallets.WALLETCONNECT;
  const address = isWalletConnect ? (state.walletAddress || wagmiAddress) : wagmiAddress;
  const { performSiweLogin, isLoading: isSiweLoading, error: siweError, isSuccess: isSiweSuccess } = useSiweLogin();
  const { title, description, Icon } = getProviderConfig(provider);

  // Track whether we've attempted connection and SIWE
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  // Track which address we've attempted SIWE for (to handle reconnections)
  const [siweAttemptedForAddress, setSiweAttemptedForAddress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initiate wallet connection on mount (only if not already connected to the SELECTED provider)
  // Skip for WalletConnect since it's already connected via EthereumProvider
  // Only trigger if we have a valid provider AND we're in the wallet_pending view
  useEffect(() => {
    if (!connectionAttempted && !isWalletConnect && provider && state.view === 'wallet_pending') {
      setConnectionAttempted(true);

      // Only skip wallet connection if already connected to the SAME wallet type
      // If connected to a different wallet, we need to switch
      if (isConnectedToSelectedProvider && address) {
        return;
      }

      connectWallet().catch(err => {
        const errorMessage = (err?.message || '').toLowerCase();

        // Ignore transient "Connector not connected" errors - these happen during disconnect/reconnect
        if (errorMessage.includes('connector not connected') || errorMessage.includes('connectornotconnectederror')) {
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
          dispatch({ type: 'GO_TO_LOGIN' });
          return;
        }

        setErrorMessage(err?.message || 'Failed to connect wallet');
      });
    }
  }, [connectionAttempted, connectWallet, isConnectedToSelectedProvider, address, provider, isWalletConnect]);

  // Once wallet is connected to the SELECTED provider with a stable address, initiate SIWE login
  // Only attempt SIWE if:
  // 1. We're connected to the selected provider with an address (or WalletConnect with stored address and provider)
  // 2. We haven't already attempted SIWE for this specific address
  // 3. We're not currently in a loading state (prevents double-calls during reconnection)
  useEffect(() => {
    // Only attempt SIWE if we're actually in the wallet_pending view
    if (state.view !== 'wallet_pending') {
      return;
    }
    
    // For WalletConnect, check if ready for SIWE:
    // - Desktop: EthereumProvider with active session
    // - Mobile AppKit: Connected via wagmi with address from state (no WalletConnect provider stored)
    const wcProvider = isWalletConnect ? getWalletConnectProvider() : null;
    const isWcDesktopReady = isWalletConnect && address && wcProvider && wcProvider.session;
    // Mobile AppKit WalletConnect: has address from state, connected via wagmi, but no WalletConnect provider
    const isWcMobileReady = isWalletConnect && address && state.walletAddress && isConnected && !wcProvider;
    const shouldAttemptSiwe = isWcDesktopReady || isWcMobileReady || (isConnectedToSelectedProvider && address);
    
    if (shouldAttemptSiwe && siweAttemptedForAddress !== address && !isSiweLoading) {
      setSiweAttemptedForAddress(address);
      setErrorMessage(null); // Clear any previous errors
      performSiweLogin(address).catch(err => {
        const errorMessage = (err?.message || '').toLowerCase();

        // Ignore transient "Connector not connected" errors
        if (errorMessage.includes('connector not connected') || errorMessage.includes('connectornotconnectederror')) {
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
          dispatch({ type: 'GO_TO_LOGIN' });
          return;
        }

        setErrorMessage(err?.message || 'SIWE login failed');
      });
    }
  }, [isConnectedToSelectedProvider, address, siweAttemptedForAddress, isSiweLoading, performSiweLogin, provider, isWalletConnect, state.walletAddress, isConnected]);

  useEffect(() => {
    // Ignore walletError for WalletConnect since we're using EthereumProvider directly, not wagmi
    if (walletError && connectionAttempted && !isWalletConnect) {
      setErrorMessage(walletError.message);
    }
  }, [walletError, connectionAttempted, isWalletConnect]);

  useEffect(() => {
    if (siweError && siweAttemptedForAddress) {
      const errorMsg = (siweError.message || '').toLowerCase();
      // Ignore "connector not connected" errors for WalletConnect since we use EthereumProvider directly
      if (isWalletConnect && (errorMsg.includes('connector not connected') || errorMsg.includes('connectornotconnectederror'))) {
        return;
      }
      setErrorMessage(siweError.message);
    }
  }, [siweError, siweAttemptedForAddress, isWalletConnect]);

  // Show spinner until SIWE is complete or there's an error
  // For WalletConnect, skip isWalletPending since connection is handled in WalletConnectView
  const isPending =
    !errorMessage &&
    ((isWalletConnect ? false : isWalletPending) || isSiweLoading || (!isSiweSuccess && !walletError && !siweError));

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
