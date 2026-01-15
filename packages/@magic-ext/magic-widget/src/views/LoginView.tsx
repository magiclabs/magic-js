import React from 'react';
import { Text } from '@magiclabs/ui-components';
import { Divider, HStack, VStack } from '../../styled-system/jsx';
import { ProviderButton } from '../components/ProviderButton';
import { WALLET_METADATA } from '../constants';
import { OAuthProvider, ThirdPartyWallets } from '../types';
import { WidgetAction } from '../reducer';
import { EmailInput } from 'src/components/EmailInput';
import { SocialProviders } from 'src/components/SocialProviders';
import WidgetHeader from 'src/components/WidgetHeader';
import { getExtensionInstance } from 'src/extension';
import { useWidgetConfig } from '../context/WidgetConfigContext';

interface LoginViewProps {
  dispatch: React.Dispatch<WidgetAction>;
}

export const LoginView = ({ dispatch }: LoginViewProps) => {
  const config = getExtensionInstance().getConfig();
  const { wallets } = useWidgetConfig();
  const { primary, social } = config?.authProviders ?? {};
  const hasEmailProvider = primary?.includes('email');
  const socialProviders = social?.map(provider => provider as OAuthProvider) ?? [];
  const showDivider = (hasEmailProvider || socialProviders.length > 0) && wallets.length > 0;

  const handleProviderSelect = (provider: ThirdPartyWallets) => {
    dispatch({ type: 'SELECT_WALLET', provider });
  };

  const handleProviderLogin = (provider: OAuthProvider) => {
    dispatch({ type: 'SELECT_PROVIDER', provider });
  };

  return (
    <>
      <WidgetHeader />
      <VStack w="full" gap={10} mt={2} px={7}>
        {config?.theme.assetUri && <img src={config.theme.assetUri} alt="Logo" width={80} height={80} />}

        <VStack width="full" gap={4}>
          {hasEmailProvider && <EmailInput />}
          {socialProviders.length > 0 && (
            <SocialProviders
              providers={Object.values(socialProviders)}
              onPress={handleProviderLogin}
              dispatch={dispatch}
            />
          )}

          {showDivider && (
            <HStack mb={3} w="full">
              <Divider color="surface.quaternary" />
              <Text aria-label="or" fontColor="text.tertiary">
                or
              </Text>
              <Divider color="surface.quaternary" />
            </HStack>
          )}

          {wallets.length > 0 && (
            <HStack gap={2} w="full">
              {wallets.map(provider => (
                <ProviderButton
                  key={provider}
                  hideLabel={wallets.length > 1 || !showDivider}
                  label={WALLET_METADATA[provider].displayName}
                  Icon={WALLET_METADATA[provider].Icon}
                  onPress={() => handleProviderSelect(provider)}
                />
              ))}
            </HStack>
          )}
        </VStack>
      </VStack>
    </>
  );
};
