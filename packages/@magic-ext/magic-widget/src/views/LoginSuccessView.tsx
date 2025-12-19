import React from 'react';
import { VStack, Box } from '../../styled-system/jsx';
import { Text, IcoCheckmarkCircleFill } from '@magiclabs/ui-components';
import { token } from '../../styled-system/tokens';
import { WidgetState } from '../reducer';
import WidgetHeader from '../components/WidgetHeader';

interface LoginSuccessViewProps {
  state: WidgetState;
}

export const LoginSuccessView = ({ state }: LoginSuccessViewProps) => {
  const { email } = state;

  return (
    <>
      <WidgetHeader showHeaderText={false} />
      <VStack gap={6} pt={4} alignItems="center" px={4}>
        {/* Success icon */}
        <Box
          w={20}
          h={20}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <IcoCheckmarkCircleFill width={64} height={64}               color={token('colors.brand.base')}
 />
        </Box>

        {/* Title and description */}
        <VStack gap={1} alignItems="center">
          <Text.H4>Welcome!</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            You have successfully logged in
          </Text>
          {email && (
            <Text fontWeight="semibold" styles={{ textAlign: 'center' }}>
              {email}
            </Text>
          )}
        </VStack>
      </VStack>
    </>
  );
};
