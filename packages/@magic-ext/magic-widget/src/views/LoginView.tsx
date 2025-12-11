import React from 'react';
import { Button, Text } from '@magiclabs/ui-components';
import { Divider, HStack, VStack } from '../../styled-system/jsx';
import { ProviderButton } from '../components/ProviderButton';
import { WALLET_METADATA } from '../constants';
import { OAuthProvider, ThirdPartyWallets } from '../types';
import { WidgetAction } from '../reducer';
import { EmailInput } from 'src/components/EmailInput';
import { SocialProviders } from 'src/components/SocialProviders';

interface LoginViewProps {
  dispatch: React.Dispatch<WidgetAction>;
}

export const LoginView = ({ dispatch }: LoginViewProps) => {
  const handleProviderSelect = (provider: ThirdPartyWallets) => {
    // Navigate to wallet pending view
    dispatch({ type: 'SELECT_WALLET', provider });
  };

  const handleProviderLogin = (provider: OAuthProvider) => {
    // Navigate to provider pending view
    dispatch({ type: 'SELECT_PROVIDER', provider });
  };

  return (
    <VStack alignItems="center" width="full" gap={4} px={6}>
      <EmailInput />
      <SocialProviders providers={Object.values(OAuthProvider)} onPress={handleProviderLogin} />

      <HStack mb={3} w="full">
        <Divider color="surface.quaternary" />
        <Text aria-label="or" fontColor="text.tertiary">
          or
        </Text>
        <Divider color="surface.quaternary" />
      </HStack>

      <HStack gap={2} w="full">
        {Object.values(ThirdPartyWallets).map(provider => (
          <ProviderButton
            key={provider}
            hideLabel={Object.values(ThirdPartyWallets).length > 1}
            label={WALLET_METADATA[provider].displayName}
            Icon={WALLET_METADATA[provider].Icon}
            onPress={() => handleProviderSelect(provider)}
          />
        ))}
      </HStack>
    </VStack>
  );
};
