import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { VStack } from '../../styled-system/jsx';
import { QRCode, Text, Skeleton } from '@magiclabs/ui-components';
import { WidgetAction } from '../reducer';
import { WALLET_METADATA } from '../constants';
import { ThirdPartyWallets } from '../types';
import WidgetHeader from '../components/WidgetHeader';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { projectId, networks, wagmiAdapter } from '../wagmi/config';
import { setWalletConnectProvider } from '../wagmi/walletconnect-provider';
import { isMobile } from '../utils/device';
import { createAppKit } from '@reown/appkit';
import type { Address } from 'viem';
import { Center } from '@styled/jsx/center';

interface WalletConnectViewProps {
  dispatch: React.Dispatch<WidgetAction>;
}

export const WalletConnectView = ({ dispatch }: WalletConnectViewProps) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const providerRef = useRef<Awaited<ReturnType<typeof EthereumProvider.init>> | null>(null);

  const [uri, setUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const [wcAddress, setWcAddress] = useState<Address | null>(null);

  const { Icon } = WALLET_METADATA[ThirdPartyWallets.WALLETCONNECT];

  // Detect mobile synchronously
  const isMobileDevice = typeof window !== 'undefined' && isMobile();

  // Create AppKit instance for mobile (only create if mobile)
  const appKit = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (!isMobileDevice) return null;
    return createAppKit({
      adapters: [wagmiAdapter],
      networks: networks,
      projectId: projectId,
    });
  }, [isMobileDevice]);

  // Mobile connection flow using AppKit modal
  const initiateMobileConnection = useCallback(() => {
    if (connectionAttempted || !appKit) return;

    setConnectionAttempted(true);
    setErrorMessage(null);

    try {
      // If already connected to a different wallet, disconnect first
      if (isConnected) {
        disconnect();
      }

      // Open AppKit modal for wallet selection
      appKit.open();
    } catch (err) {
      const error = err as Error;
      setErrorMessage(error?.message || 'Failed to open wallet selection');
    }
  }, [connectionAttempted, appKit, isConnected, disconnect]);

  // Desktop connection flow using EthereumProvider (existing implementation)
  const initiateDesktopConnection = useCallback(async () => {
    if (connectionAttempted) return;

    setConnectionAttempted(true);
    setErrorMessage(null);

    try {
      // If already connected to a different wallet, disconnect first
      if (isConnected) {
        disconnect();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Initialize Ethereum provider
      const chainIds = networks.map(n => Number(n.id)) as [number, ...number[]];
      const provider = await EthereumProvider.init({
        projectId,
        chains: chainIds,
        optionalChains: chainIds,
        showQrModal: false, // We handle the QR code display ourselves
      });

      providerRef.current = provider;
      setWalletConnectProvider(provider); // Store for SIWE signing

      // Listen for display_uri event to get QR code
      provider.on('display_uri', (uri: string) => {
        setUri(uri);
      });

      // Connect
      await provider.connect();

      // Get connected address
      const accounts = provider.accounts;
      if (accounts && accounts.length > 0) {
        setWcAddress(accounts[0] as Address);
      }
    } catch (err) {
      const error = err as Error;
      const errorMsg = (error?.message || '').toLowerCase();

      // If user rejected/denied the connection, go back to login
      if (
        errorMsg.includes('user rejected') ||
        errorMsg.includes('user denied') ||
        errorMsg.includes('rejected the request') ||
        errorMsg.includes('user cancelled') ||
        errorMsg.includes('user canceled')
      ) {
        dispatch({ type: 'GO_TO_LOGIN' });
        return;
      }

      setErrorMessage(error?.message || 'Failed to connect wallet');
    }
  }, [connectionAttempted, isConnected, disconnect, dispatch]);

  // Initiate connection based on device type
  useEffect(() => {
    if (isMobileDevice) {
      initiateMobileConnection();
    } else {
      initiateDesktopConnection();
    }
  }, [isMobileDevice, initiateMobileConnection, initiateDesktopConnection]);

  // For mobile: Listen for connection via wagmi (AppKit connects through wagmi)
  useEffect(() => {
    if (isMobileDevice && isConnected && address) {
      // AppKit connected through wagmi, transition to WalletPendingView
      dispatch({ type: 'WALLETCONNECT_CONNECTED', address: address });
    }
  }, [isMobileDevice, isConnected, address, dispatch]);

  // For desktop: When connection is established via EthereumProvider, transition to WalletPendingView for SIWE
  useEffect(() => {
    if (!isMobileDevice && wcAddress) {
      // Store the provider reference for SIWE signing
      // Pass the address through the action
      dispatch({ type: 'WALLETCONNECT_CONNECTED', address: wcAddress });
    }
  }, [isMobileDevice, wcAddress, dispatch]);

  const handleBack = () => {
    // Cleanup provider on back (desktop only)
    if (providerRef.current) {
      providerRef.current.disconnect().catch(() => {
        // Ignore cleanup errors
      });
      providerRef.current = null;
      setWalletConnectProvider(null);
    }
    // Close AppKit modal if open (mobile)
    if (appKit) {
      appKit.close();
    }
    dispatch({ type: 'GO_TO_LOGIN' });
  };

  // Show error state
  if (errorMessage) {
    return (
      <>
        <WidgetHeader onPressBack={handleBack} showHeaderText={false} />
        <VStack gap={6} pt={4} alignItems="center">
          <Icon width={60} height={60} />
          <VStack gap={2} alignItems="center">
            <Text.H4>Connection Failed</Text.H4>
            <Text variant="error" styles={{ textAlign: 'center' }}>
              {errorMessage}
            </Text>
          </VStack>
        </VStack>
      </>
    );
  }

  // Mobile: Show loading state while AppKit modal is open
  if (isMobileDevice) {
    return (
      <>
        <WidgetHeader onPressBack={handleBack} showHeaderText={false} />
        <VStack gap={6} pt={4} alignItems="center">
          <Icon width={60} height={60} />
          <VStack gap={2} alignItems="center">
            <Text.H4>Select your wallet</Text.H4>
            <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
              Choose a wallet app to connect
            </Text>
          </VStack>
        </VStack>
      </>
    );
  }

  // Desktop: Show custom QR code (existing behavior)
  return (
    <>
      <WidgetHeader onPressBack={handleBack} showHeaderText={false} />
      <VStack gap={6} pt={4} alignItems="center">
        {uri ? (
          <QRCode
            eyeRadius={8}
            value={uri}
            qrStyle="dots"
            size={262}
            logoHeight={64}
            logoWidth={64}
            logoPadding={16}
            style={{ borderRadius: 16 }}
            quietZone={12}
          />
        ) : (
          <Center width="294px" height="294px">
            <Skeleton width={286} height={286} borderRadius={16} backgroundColor="surface.secondary" />
          </Center>
        )}
        <VStack gap={2} alignItems="center">
          <Text.H4>Scan with your wallet</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            Open your mobile wallet and scan this QR code to connect
          </Text>
        </VStack>
      </VStack>
    </>
  );
};
