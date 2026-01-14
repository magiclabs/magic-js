import { IcoLockLocked, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import React from 'react';
import WidgetHeader from 'src/components/WidgetHeader';
import { getExtensionInstance } from 'src/extension';
import { WidgetAction } from 'src/reducer';

export const LostRecoveryCode = ({ dispatch }: { dispatch: React.Dispatch<WidgetAction> }) => {
  const config = getExtensionInstance().getConfig();
  const { appName } = config?.theme ?? {};

  const handleBack = () => {
    dispatch({ type: 'LOST_DEVICE' });
  };

  return (
    <>
      <WidgetHeader onPressBack={handleBack} showHeaderText={false} />
      <VStack gap={6} px={6}>
        <IcoLockLocked width={60} height={60} color={token('colors.brand.base')} />
        <VStack>
          <Text.H4 styles={{ textAlign: 'center' }}>Contact {appName} support</Text.H4>
          <Text styles={{ textAlign: 'center' }}>
            For help recovering your account, please contact the {appName} support team.
          </Text>
        </VStack>
      </VStack>
    </>
  );
};
