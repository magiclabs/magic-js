import React from 'react';
import { HStack, VStack } from '@styled/jsx';
import { Text, IcoDismissCircleFill, Button } from '@magiclabs/ui-components';
import { WidgetAction, WidgetState } from '../reducer';
import WidgetHeader from '../components/WidgetHeader';
import { useFarcasterLogin } from '../hooks/useFarcasterLogin';
import { token } from '@styled/tokens';

interface FarcasterFailedViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const FarcasterFailedView = ({ state, dispatch }: FarcasterFailedViewProps) => {
  const { cancel, retry } = useFarcasterLogin(dispatch);
  const { error } = state;

  return (
    <>
      <WidgetHeader showHeaderText={false} />
      <VStack gap={8}>
        <IcoDismissCircleFill width={48} height={48} color={token('colors.negative.darker')} />
        <VStack gap={1}>
          <Text.H4 styles={{ textAlign: 'center' }}>Request Denied</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            {error || 'Farcaster login was denied or failed'}
          </Text>
        </VStack>
        <HStack gap={2} w="full">
          <Button variant="primary" expand onPress={retry} label="Try again" />
          <Button variant="neutral" expand onPress={cancel} label="Cancel" />
        </HStack>
      </VStack>
    </>
  );
};
