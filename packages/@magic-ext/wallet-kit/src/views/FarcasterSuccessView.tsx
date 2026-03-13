import React from 'react';
import { VStack } from '@styled/jsx';
import { Text, IcoCheckmarkCircleFill } from '@magiclabs/ui-components';
import { WidgetState } from '../reducer';
import WidgetHeader from '../components/WidgetHeader';
import { FARCASTER_BRAND_COLOR } from '../constants';

interface FarcasterSuccessViewProps {
  state: WidgetState;
}

export const FarcasterSuccessView = ({ state }: FarcasterSuccessViewProps) => {
  const { farcasterUsername } = state;

  return (
    <>
      <WidgetHeader showHeaderText={false} />
      <VStack gap={8}>
        <IcoCheckmarkCircleFill width={48} height={48} color={FARCASTER_BRAND_COLOR} />
        <VStack gap={1}>
          <Text.H4 styles={{ textAlign: 'center' }}>You're all set</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            Successfully signed in{farcasterUsername ? ` with ${farcasterUsername}` : ''}
          </Text>
        </VStack>
      </VStack>
    </>
  );
};
