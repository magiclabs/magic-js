import React from 'react';
import { css } from '@styled/css';
import { Box, Stack, VStack } from '@styled/jsx';
import { OAuthProvider } from 'src/types';
import { WidgetAction } from 'src/reducer';
import WidgetHeader from 'src/components/WidgetHeader';
import { ProviderButton } from 'src/components/ProviderButton';
import { OAUTH_METADATA } from 'src/constants';
import { getExtensionInstance } from 'src/extension';

interface AdditionalProvidersViewProps {
  dispatch: React.Dispatch<WidgetAction>;
}

export default function AdditionalProvidersView({ dispatch }: AdditionalProvidersViewProps) {
  const config = getExtensionInstance().getConfig();
  const socialProviders = (config?.authProviders?.social ?? []) as OAuthProvider[];

  const handleProviderLogin = (provider: OAuthProvider) => {
    dispatch({ type: 'SELECT_PROVIDER', provider });
  };

  const handlePressBack = () => {
    dispatch({ type: 'GO_TO_LOGIN' });
  };

  return (
    <>
      <WidgetHeader onPressBack={handlePressBack} showHeaderText={false} />
      <VStack w="full">
        <Box
          mt={4}
          mb={2}
          overflowY="auto"
          w="full"
          px={4}
          scrollbarWidth="thin"
          scrollbarColor="rgba(143, 147, 153, 0.4) transparent"
          className={css({
            '&::-webkit-scrollbar': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
          })}
        >
          <Stack gap={2} maxH="384px" w="full" px={2}>
            {socialProviders.map(provider => (
              <ProviderButton
                key={provider}
                label={OAUTH_METADATA[provider].displayName}
                Icon={OAUTH_METADATA[provider].Icon}
                onPress={() => handleProviderLogin(provider)}
              />
            ))}
          </Stack>
        </Box>
      </VStack>
    </>
  );
}
