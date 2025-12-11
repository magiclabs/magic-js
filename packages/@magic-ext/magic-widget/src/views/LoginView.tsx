import React from 'react';
import { Button, Text } from '@magiclabs/ui-components';
import { HStack, VStack } from '../../styled-system/jsx';
import { ProviderButton } from '../components/ProviderButton';
import { WALLET_METADATA } from '../constants';
import { ThirdPartyWallets } from '../types';
import { WidgetAction } from '../reducer';

interface LoginViewProps {
  dispatch: React.Dispatch<WidgetAction>;
}

export const LoginView = ({ dispatch }: LoginViewProps) => {
  const handleEmailLogin = () => {
    // Navigate to email input view
    dispatch({ type: 'GO_TO_EMAIL_INPUT' });
  };

  const handleWalletSelect = (wallet: string) => {
    // Navigate to wallet pending view
    dispatch({ type: 'SELECT_WALLET', wallet });
  };

  return (
    <VStack alignItems="center" width="full" gap={4} px={6} py={4}>
      <Text size="lg">Sign in to continue</Text>

      {/* Email login button */}
      <Button label="Continue with Email" onPress={handleEmailLogin} expand />

      {/* Wallet options */}
      <HStack gap={2} w="full">
        {Object.values(ThirdPartyWallets).map(provider => (
          <ProviderButton
            key={provider}
            hideLabel={Object.values(ThirdPartyWallets).length > 1}
            label={WALLET_METADATA[provider].displayName}
            Icon={WALLET_METADATA[provider].Icon}
            onPress={() => handleWalletSelect(provider)}
          />
        ))}
      </HStack>
    </VStack>
  );
};
