import React, { useState } from 'react';
import { VStack, Box } from '../../styled-system/jsx';
import { IcoCheckmarkCircleFill, LoadingSpinner, Text } from '@magiclabs/ui-components';
import { css } from '../../styled-system/css';
import { getProviderConfig } from '../lib/provider-config';
import { token } from '../../styled-system/tokens';
import { WidgetAction } from '../reducer';
import { LoginProvider } from 'src/types';

const centeredIconClass = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

interface PendingViewProps {
  provider: LoginProvider;
  dispatch: React.Dispatch<WidgetAction>;
}

export const PendingView = ({ provider, dispatch }: PendingViewProps) => {
  const [isPending, setIsPending] = useState(true);
  const { title, description, Icon } = getProviderConfig(provider);

  return (
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

      <VStack gap={2}>
        <Text.H4>{title}</Text.H4>
        <Text fontColor="text.tertiary">{description}</Text>
      </VStack>
    </VStack>
  );
};
