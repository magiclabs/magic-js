import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { VStack, Center } from '@styled/jsx';
import { QRCode, Text, Skeleton } from '@magiclabs/ui-components';
import { WidgetAction } from '../reducer';
import { WALLET_METADATA } from '../constants';
import { ThirdPartyWallets } from '../types';
import WidgetHeader from '../components/WidgetHeader';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { networks } from '../wagmi/config';
import { getExtensionInstance } from '../extension';
import { setWalletConnectProvider } from '../wagmi/walletconnect-provider';
import { isMobile } from '../utils/device';
import { createAppKit } from '@reown/appkit';
import type { Address } from 'viem';

// WalletConnect logo as data URL (base64 encoded SVG)
const WALLETCONNECT_LOGO_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNSAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTE2NzUgNy41MTYwNUM4LjgzMzM4IDMuNjgxMzQgMTUuMTgzNSAzLjY4MTM0IDE5LjEwMDEgNy41MTYwNUwxOS41NzE1IDcuOTc3NTZDMTkuNzY3MyA4LjE2OTI5IDE5Ljc2NzMgOC40ODAxNiAxOS41NzE1IDguNjcxOUwxNy45NTkgMTAuMjUwNkMxNy44NjExIDEwLjM0NjUgMTcuNzAyNCAxMC4zNDY1IDE3LjYwNDQgMTAuMjUwNkwxNi45NTU4IDkuNjE1NTRDMTQuMjIzNCA2Ljk0MDM1IDkuNzkzNDMgNi45NDAzNSA3LjA2MTA5IDkuNjE1NTRMNi4zNjY0MyAxMC4yOTU3QzYuMjY4NTEgMTAuMzkxNSA2LjEwOTc2IDEwLjM5MTUgNi4wMTE4NCAxMC4yOTU3TDQuMzk5MzcgOC43MTY5M0M0LjIwMzU0IDguNTI1MiA0LjIwMzU0IDguMjE0MzMgNC4zOTkzNyA4LjAyMjZMNC45MTY3NSA3LjUxNjA1Wk0yMi40MzQ5IDEwLjc4MTFMMjMuODcgMTIuMTg2MUMyNC4wNjU4IDEyLjM3NzkgMjQuMDY1OCAxMi42ODg3IDIzLjg3IDEyLjg4MDVMMTcuMzk5IDE5LjIxNjJDMTcuMjAzMiAxOS40MDc5IDE2Ljg4NTcgMTkuNDA3OSAxNi42ODk4IDE5LjIxNjJDMTYuNjg5OCAxOS4yMTYyIDE2LjY4OTggMTkuMjE2MiAxNi42ODk4IDE5LjIxNjJMMTIuMDk3MSAxNC43MTk2QzEyLjA0ODIgMTQuNjcxNiAxMS45Njg4IDE0LjY3MTYgMTEuOTE5OCAxNC43MTk2TDcuMzI3MjEgMTkuMjE2MkM3LjEzMTM4IDE5LjQwNzkgNi44MTM4NyAxOS40MDggNi42MTgwNCAxOS4yMTYyQzYuNjE4MDQgMTkuMjE2MiA2LjYxODA0IDE5LjIxNjIgNi42MTgwNCAxOS4yMTYyTDAuMTQ2ODc0IDEyLjg4MDRDLTAuMDQ5NTc5IDEyLjY4ODcgLTAuMDQ5NTc5IDEyLjM3NzggMC4xNDY4NzQgMTIuMTg2MUwxLjU4MTk4IDEwLjc4MUMxLjc3NzgxIDEwLjU4OTIgMi4wOTUzMiAxMC41ODkyIDIuMjkxMTUgMTAuNzgxTDYuODgzOTIgMTUuMjc3N0M2LjkzMjg4IDE1LjMyNTYgNy4wMTIyNiAxNS4zMjU2IDcuMDYxMjIgMTUuMjc3N0M3LjA2MTIxIDE1LjI3NzcgNy4wNjEyMiAxNS4yNzc3IDcuMDYxMjIgMTUuMjc3N0wxMS42NTM4IDEwLjc4MUMxMS44NDk2IDEwLjU4OTIgMTIuMTY3MSAxMC41ODkyIDEyLjM2MjkgMTAuNzgxQzEyLjM2MjkgMTAuNzgxIDEyLjM2MjkgMTAuNzgxIDEyLjM2MjkgMTAuNzgxTDE2Ljk1NTcgMTUuMjc3N0MxNy4wMDQ3IDE1LjMyNTYgMTcuMDg0IDE1LjMyNTYgMTcuMTMzIDE1LjI3NzdMMjEuNzI1NyAxMC43ODExQzIxLjkyMTUgMTAuNTg5MyAyMi4yMzkgMTAuNTg5MyAyMi40MzQ5IDEwLjc4MTFaIiBmaWxsPSIjM0I5OUZDIi8+Cjwvc3ZnPgo=';

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

  const isMobileDevice = typeof window !== 'undefined' && isMobile();

  // Create AppKit instance for mobile (only create if mobile)
  const appKit = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (!isMobileDevice) return null;
    const ext = getExtensionInstance();
    return createAppKit({
      adapters: [ext.wagmiAdapter],
      networks: networks,
      projectId: ext.projectId,
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

  // Desktop connection flow using EthereumProvider
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
        projectId: getExtensionInstance().projectId,
        chains: chainIds,
        optionalChains: chainIds,
        showQrModal: false,
      });

      providerRef.current = provider;
      setWalletConnectProvider(provider);

      provider.on('display_uri', (uri: string) => {
        setUri(uri);
      });

      await provider.connect();

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
      dispatch({ type: 'WALLETCONNECT_CONNECTED', address: wcAddress });
    }
  }, [isMobileDevice, wcAddress, dispatch]);

  const handleBack = () => {
    if (providerRef.current) {
      providerRef.current.disconnect().catch(() => {
        // Ignore cleanup errors
      });
      providerRef.current = null;
      setWalletConnectProvider(null);
    }
    if (appKit) {
      appKit.close();
    }
    dispatch({ type: 'GO_TO_LOGIN' });
  };

  if (errorMessage) {
    return (
      <>
        <WidgetHeader onPressBack={handleBack} showHeaderText={false} />
        <VStack gap={6} pt={4} alignItems="center">
          <Icon width={60} height={60} />
          <VStack gap={2} alignItems="center" px={7}>
            <Text.H4 styles={{ textAlign: 'center' }}>Connection Failed</Text.H4>
            <Text variant="error" styles={{ textAlign: 'center' }}>
              {errorMessage}
            </Text>
          </VStack>
        </VStack>
      </>
    );
  }

  if (isMobileDevice) {
    return (
      <>
        <WidgetHeader onPressBack={handleBack} showHeaderText={false} />
        <VStack gap={6} pt={4} alignItems="center">
          <Icon width={60} height={60} />
          <VStack gap={2} alignItems="center" px={7}>
            <Text.H4 styles={{ textAlign: 'center' }}>Select your wallet</Text.H4>
            <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
              Choose a wallet app to connect
            </Text>
          </VStack>
        </VStack>
      </>
    );
  }

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
            logoImage={WALLETCONNECT_LOGO_DATA_URL}
            logoHeight={52}
            logoWidth={52}
            logoPadding={12}
            style={{ borderRadius: 16 }}
            quietZone={12}
          />
        ) : (
          <Center width="294px" height="294px">
            <Skeleton width={286} height={286} borderRadius={16} backgroundColor="surface.secondary" />
          </Center>
        )}
        <VStack gap={2} alignItems="center" px={7}>
          <Text.H4 styles={{ textAlign: 'center' }}>Scan with your wallet</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            Open your mobile wallet and scan this QR code to connect
          </Text>
        </VStack>
      </VStack>
    </>
  );
};
