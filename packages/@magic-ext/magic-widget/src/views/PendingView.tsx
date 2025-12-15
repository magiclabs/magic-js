import React, { useEffect, useState } from 'react';
import { VStack, Box } from '../../styled-system/jsx';
import { IcoCheckmarkCircleFill, LoadingSpinner, Text } from '@magiclabs/ui-components';
import { css } from '../../styled-system/css';
import { getProviderConfig } from '../lib/provider-config';
import { token } from '../../styled-system/tokens';
import { WidgetAction } from '../reducer';
import { ThirdPartyWallets } from '../types';
import { useWalletConnect } from '../hooks/useWalletConnect';
import { useSiweLogin } from '../hooks/useSiweLogin';

const centeredIconClass = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

interface PendingViewProps {
  provider: ThirdPartyWallets;
  dispatch: React.Dispatch<WidgetAction>;
}

export const PendingView = ({ provider, dispatch }: PendingViewProps) => {
  const {
    connectWallet,
    isPending: isWalletPending,
    error: walletError,
    address,
    isConnected,
  } = useWalletConnect(provider);
  const { performSiweLogin, isLoading: isSiweLoading, error: siweError, isSuccess: isSiweSuccess } = useSiweLogin();
  const { title, description, Icon } = getProviderConfig(provider);

  // Track whether we've attempted connection and SIWE
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const [siweAttempted, setSiweAttempted] = useState(false);
  // Local error state to display on this view instead of navigating away
  const [localError, setLocalError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('[PendingView] State:', {
      isConnected,
      address,
      isWalletPending,
      connectionAttempted,
      siweAttempted,
      isSiweLoading,
      isSiweSuccess,
      walletError: walletError?.message,
      siweError: siweError?.message,
    });
  }, [
    isConnected,
    address,
    isWalletPending,
    connectionAttempted,
    siweAttempted,
    isSiweLoading,
    isSiweSuccess,
    walletError,
    siweError,
  ]);

  // Initiate wallet connection on mount (or skip if already connected)
  useEffect(() => {
    if (!connectionAttempted) {
      setConnectionAttempted(true);
      console.log('[PendingView] Attempting wallet connection...');
      // connectWallet handles the already-connected case internally
      connectWallet().catch(err => {
        console.error('[PendingView] Wallet connection error:', err);
        setLocalError(err?.message || 'Failed to connect wallet');
      });
    }
  }, [connectionAttempted, connectWallet]);

  // Once wallet is connected, initiate SIWE login
  useEffect(() => {
    if (isConnected && address && !siweAttempted) {
      setSiweAttempted(true);
      console.log('[PendingView] Wallet connected, starting SIWE login for address:', address);
      performSiweLogin(address).catch(err => {
        console.error('[PendingView] SIWE login error:', err);
        setLocalError(err?.message || 'SIWE login failed');
      });
    }
  }, [isConnected, address, siweAttempted, performSiweLogin]);

  // Handle SIWE success - just log it, stay on checkmark view
  useEffect(() => {
    if (isSiweSuccess) {
      console.log('[PendingView] SIWE login successful!');
    }
  }, [isSiweSuccess]);

  // Update local error from hook errors
  useEffect(() => {
    if (walletError && connectionAttempted) {
      setLocalError(walletError.message);
    }
  }, [walletError, connectionAttempted]);

  useEffect(() => {
    if (siweError && siweAttempted) {
      setLocalError(siweError.message);
    }
  }, [siweError, siweAttempted]);

  // Show spinner until SIWE is complete or there's an error
  const showSpinner =
    !localError && (isWalletPending || isSiweLoading || (!isSiweSuccess && !walletError && !siweError));

  // Determine what text to show
  const statusText = localError
    ? localError
    : isSiweSuccess
      ? 'Success!'
      : isSiweLoading
        ? 'Signing message...'
        : description;

  return (
    <VStack gap={6} pt={4}>
      <Box position="relative" h={20} w={20}>
        {showSpinner && <LoadingSpinner size={80} strokeWidth={8} neutral progress={40} />}
        {showSpinner ? (
          <Icon width={36} height={36} className={centeredIconClass} />
        ) : (
          <IcoCheckmarkCircleFill
            width={36}
            height={36}
            color={localError ? token('colors.negative.base') : token('colors.brand.base')}
            className={centeredIconClass}
          />
        )}
      </Box>

      <VStack gap={2}>
        <Text.H4>{title}</Text.H4>
        <Text fontColor="text.tertiary">{statusText}</Text>
      </VStack>
    </VStack>
  );
};
