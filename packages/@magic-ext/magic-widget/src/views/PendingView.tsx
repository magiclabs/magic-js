import React, { useEffect, useRef } from 'react';
import { VStack, Box } from '../../styled-system/jsx';
import { IcoCheckmarkCircleFill, LoadingSpinner, Text } from '@magiclabs/ui-components';
import { css } from '../../styled-system/css';
import { getProviderConfig } from '../lib/provider-config';
import { token } from '../../styled-system/tokens';
import { WidgetAction } from '../reducer';
import { ThirdPartyWallets } from '../types';
import { useWalletConnect } from '../hooks/useWalletConnect';

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
  const { connectWallet, isPending, error, isConnected } = useWalletConnect(provider);
  const { title, description, Icon } = getProviderConfig(provider);
  const connectionAttempted = useRef(false);

  // Initiate wallet connection on mount
  useEffect(() => {
    if (!connectionAttempted.current) {
      connectionAttempted.current = true;
      connectWallet();
    }
  }, [connectWallet]);

  // Handle connection success
  useEffect(() => {
    if (isConnected) {
      dispatch({ type: 'WALLET_CONNECTED' });
    }
  }, [isConnected, dispatch]);

  // Handle connection error
  useEffect(() => {
    if (error) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [error, dispatch]);

  const showSpinner = isPending || (!isConnected && !error);

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
            color={token('colors.brand.base')}
            className={centeredIconClass}
          />
        )}
      </Box>

      <VStack gap={2}>
        <Text.H4>{title}</Text.H4>
        <Text fontColor="text.tertiary">{description}</Text>
      </VStack>
    </VStack>
  );
};
