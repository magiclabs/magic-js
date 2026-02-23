import React from 'react';
import { IcoMessage, Text, IcoFingerprintFill } from '@magiclabs/ui-components';
import { Box, Divider, Flex, HStack, VStack } from '@styled/jsx';
import { ProviderButton } from '../components/ProviderButton';
import { WALLET_METADATA } from '../constants';
import { OAuthProvider, ThirdPartyWallet } from '../types';
import { WidgetAction, WidgetState } from '../reducer';
import { EmailInput } from '../components/EmailInput';
import { SocialProviders } from '../components/SocialProviders';
import WidgetHeader from '../components/WidgetHeader';
import { getExtensionInstance } from '../extension';
import { useWidgetConfig } from '../context/WidgetConfigContext';

interface LoginViewProps {
  dispatch: React.Dispatch<WidgetAction>;
  state: WidgetState;
}

export const LoginView = ({ dispatch, state }: LoginViewProps) => {
  const config = getExtensionInstance().getConfig();
  const { wallets, enableFarcaster } = useWidgetConfig();
  const { primary, secondary, social } = config?.authProviders ?? {};
  const hasEmailProvider = primary?.includes('email');
  const hasSmsProvider = primary?.includes('sms');
  const hasWebAuthnProvider = primary?.includes('webauthn') || secondary?.includes('webauthn');
  const socialProviders = social?.map(provider => provider as OAuthProvider) ?? [];
  const hasAlternativeLogin = hasSmsProvider || hasWebAuthnProvider;

  const showDivider =
    (hasEmailProvider || hasSmsProvider || hasWebAuthnProvider || socialProviders.length > 0 || enableFarcaster) &&
    wallets.length > 0;

  const handleProviderSelect = (provider: ThirdPartyWallet) => {
    dispatch({ type: 'SELECT_WALLET', provider });
  };

  const handleProviderLogin = (provider: OAuthProvider) => {
    dispatch({ type: 'SELECT_PROVIDER', provider });
  };

  const handleSmsClick = () => {
    dispatch({ type: 'GO_TO_SMS_LOGIN' });
  };

  const handleWebAuthnClick = () => {
    dispatch({ type: 'GO_TO_WEBAUTHN_LOGIN' });
  };

  return (
    <>
      <WidgetHeader />
      <VStack w="full" gap={10} mt={2} px={7}>
        {config?.theme.assetUri && <img src={config.theme.assetUri} alt="Logo" width={80} height={80} />}

        <VStack width="full" maxWidth="25rem" gap={4}>
          {hasEmailProvider && (
            <EmailInput
              error={state.loginMethod === 'email' ? state.error : undefined}
              isLoading={state.loginMethod === 'email' && state.otpLoginStatus === 'sending'}
            />
          )}

          {hasAlternativeLogin && (
            <Flex gap={2} w="full" justify="center">
              {hasSmsProvider && (
                <Box flex={1}>
                  <ProviderButton label="SMS" Icon={IcoMessage} onPress={handleSmsClick} center />
                </Box>
              )}
              {hasWebAuthnProvider && (
                <Box flex={1}>
                  <ProviderButton label="Passkey" Icon={IcoFingerprintFill} onPress={handleWebAuthnClick} center />
                </Box>
              )}
            </Flex>
          )}

          {(socialProviders.length > 0 || enableFarcaster) && (
            <SocialProviders
              providers={Object.values(socialProviders)}
              onPress={handleProviderLogin}
              dispatch={dispatch}
              enableFarcaster={enableFarcaster}
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
            <Flex gap={2} w="full" direction={showDivider ? 'row' : 'column'} justify="center">
              {wallets.map(provider => (
                <ProviderButton
                  key={provider}
                  hideLabel={wallets.length > 1 && showDivider}
                  label={WALLET_METADATA[provider].displayName}
                  Icon={WALLET_METADATA[provider].Icon}
                  onPress={() => handleProviderSelect(provider)}
                />
              ))}
            </Flex>
          )}
        </VStack>
      </VStack>
    </>
  );
};
