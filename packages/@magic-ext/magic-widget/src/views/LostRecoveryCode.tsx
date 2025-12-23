import { IcoLockLocked, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import React from 'react';
import WidgetHeader from 'src/components/WidgetHeader';
import { useEmailLogin } from 'src/context';
import { getExtensionInstance } from 'src/extension';

export const LostRecoveryCode = () => {
  const { cancelLogin } = useEmailLogin();
  const config = getExtensionInstance().getConfig();
  const { appName } = config?.theme ?? {};

  return (
    <>
      <WidgetHeader onPressBack={cancelLogin} showHeaderText={false} />
      <VStack gap={6} pt={4} px={6} alignItems="center">
        <Box position="relative" h={20} w={20} display="flex" alignItems="center" justifyContent="center">
          <Box
            w={16}
            h={16}
            borderRadius="full"
            bg="brand.lightest"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <IcoLockLocked width={32} height={32} color={token('colors.brand.base')} />
          </Box>
        </Box>

        {/* Title and description */}
        <VStack gap={1} alignItems="center" w="full">
          <Box w="full" style={{ wordBreak: 'break-word' }}>
            <Text.H4 styles={{ textAlign: 'center' }}>Contact {appName} support</Text.H4>
            <Text styles={{ textAlign: 'center' }}>
              For help recovering your account, please contact the {appName} support team.
            </Text>
          </Box>
        </VStack>
      </VStack>
    </>
  );
};
