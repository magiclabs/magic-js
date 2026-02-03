import { ButtonContainer, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Flex } from '@styled/jsx';
import React, { ElementType } from 'react';

interface ProviderButtonProps {
  label?: string;
  Icon: ElementType;
  onPress: () => void;
  hideLabel?: boolean;
}

export const ProviderButton = ({ label, Icon, onPress, hideLabel }: ProviderButtonProps) => {
  return (
    <ButtonContainer
      onPress={onPress}
      borderRadius={14}
      className={css({
        w: 'full',
        px: 4,
        py: 3,
        bg: 'neutral.quaternary',
        _hover: { bg: 'neutral.tertiary' },
      })}
    >
      <Flex gap={3} w="full" justifyContent={hideLabel ? 'center' : 'flex-start'} alignItems="center">
        <Icon width={24} height={24} />
        {!hideLabel && label && (
          <Text fontWeight="medium" styles={{ lineHeight: '1.5rem' }}>
            {label}
          </Text>
        )}
      </Flex>
    </ButtonContainer>
  );
};
