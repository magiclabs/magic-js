import React from 'react';
import { IcoCheckmarkCircleFill, IcoDismissCircleFill, LoadingSpinner, Text } from '@magiclabs/ui-components';
import WidgetHeader from 'src/components/WidgetHeader';
import { VStack } from 'src/components/Stack';

interface PendingProps {
  onPressBack: () => void;
  title: string;
  description: string;
  Icon: React.ElementType;
  isPending: boolean;
  errorMessage: string | null;
}

const centeredIconClass = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';

export const Pending = ({ onPressBack, title, description, Icon, isPending, errorMessage }: PendingProps) => {
  return (
    <>
      <WidgetHeader onPressBack={isPending || errorMessage ? onPressBack : undefined} showHeaderText={false} />
      <VStack className="gap-6 pt-4">
        <div className="relative h-20 w-20">
          {isPending && <LoadingSpinner size={80} strokeWidth={8} neutral progress={40} />}
          {isPending ? (
            <Icon width={36} height={36} className={centeredIconClass} />
          ) : errorMessage ? (
            <IcoDismissCircleFill
              width={36}
              height={36}
              color="var(--color-negative-darker)"
              className={centeredIconClass}
            />
          ) : (
            <IcoCheckmarkCircleFill
              width={36}
              height={36}
              color="var(--color-brand-base)"
              className={centeredIconClass}
            />
          )}
        </div>

        <VStack className="gap-2 px-7">
          <Text.H4 styles={{ textAlign: 'center' }}>{title}</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            {description}
          </Text>
          {errorMessage && (
            <Text variant="error" styles={{ textAlign: 'center' }}>
              {errorMessage}
            </Text>
          )}
        </VStack>
      </VStack>
    </>
  );
};
