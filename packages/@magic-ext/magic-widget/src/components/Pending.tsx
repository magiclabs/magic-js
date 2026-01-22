import React from 'react';
import { VStack, Box } from '../../styled-system/jsx';
import { IcoCheckmarkCircleFill, LoadingSpinner, Text } from '@magiclabs/ui-components';
import { css } from '../../styled-system/css';
import { token } from '../../styled-system/tokens';
import WidgetHeader from 'src/components/WidgetHeader';

interface PendingProps {
  onPressBack: () => void;
  title: string;
  description: string;
  Icon: React.ElementType;
  isPending: boolean;
  errorMessage: string | null;
}

const centeredIconClass = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const Pending = ({ onPressBack, title, description, Icon, isPending, errorMessage }: PendingProps) => {
  return (
    <>
      <WidgetHeader onPressBack={isPending ? onPressBack : undefined} showHeaderText={false} />
      <VStack gap={6} pt={4}>
        <Box position="relative" h={20} w={20}>
          {isPending && <LoadingSpinner size={80} strokeWidth={8} neutral progress={40} />}
          {isPending ? (
            <Icon width={36} height={36} className={centeredIconClass} />
          ) : (
            <IcoCheckmarkCircleFill
              width={36}
              height={36}
              color={token('colors.brand.base')}
              className={centeredIconClass}
            />
          )}
        </Box>

        <VStack gap={2} px={7}>
          <Text.H4>{title}</Text.H4>
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
