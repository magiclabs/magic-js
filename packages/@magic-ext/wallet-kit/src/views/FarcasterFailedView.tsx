import React from 'react';
import { VStack } from '@styled/jsx';
import { Text, IcoDismissCircleFill, Button } from '@magiclabs/ui-components';
import { WidgetAction, WidgetState } from '../reducer';
import WidgetHeader from '../components/WidgetHeader';
import { useFarcasterLogin } from '../hooks/useFarcasterLogin';

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
        <IcoDismissCircleFill width={48} height={48} color="var(--magic-color-error-base, #e3364e)" />
        <VStack gap={1}>
          <Text.H4 styles={{ textAlign: 'center' }}>Request Denied</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            {error || 'Farcaster login was denied or failed'}
          </Text>
        </VStack>
        <VStack gap={2} w="full" px={7}>
          <Button variant="primary" expand onPress={retry} label="Try again" />
          <Button variant="neutral" expand onPress={cancel} label="Cancel" />
        </VStack>
      </VStack>
    </>
  );
};
