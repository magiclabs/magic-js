import React from 'react';
import { VStack } from '../../styled-system/jsx';
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
      <VStack gap={6}>
        <IcoCheckmarkCircleFill width={60} height={60} color={token('colors.brand.base')} />

        <VStack gap={1}>
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
