import React from 'react';
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
      <div className="flex flex-col items-center gap-8">
        <IcoCheckmarkCircleFill width={48} height={48} color={FARCASTER_BRAND_COLOR} />
        <div className="flex flex-col items-center gap-1">
          <Text.H4 styles={{ textAlign: 'center' }}>You're all set</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            Successfully signed in{farcasterUsername ? ` with ${farcasterUsername}` : ''}
          </Text>
        </div>
      </div>
    </>
  );
};
