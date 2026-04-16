import { ButtonContainer, Text } from '@magiclabs/ui-components';
import React, { ElementType } from 'react';

interface ProviderButtonProps {
  label?: string;
  Icon: ElementType;
  onPress: () => void;
  hideLabel?: boolean;
  center?: boolean;
}

export const ProviderButton = ({ label, Icon, onPress, hideLabel, center }: ProviderButtonProps) => {
  return (
    <ButtonContainer
      onPress={onPress}
      borderRadius={14}
      className="w-full px-4 py-3 bg-neutral-quaternary hover:bg-neutral-tertiary"
    >
      <div
        className={`flex flex-row items-center gap-3 w-full ${hideLabel || center ? 'justify-center' : 'justify-start'}`}
      >
        <Icon width={24} height={24} />
        {!hideLabel && label && (
          <Text fontWeight="medium" styles={{ lineHeight: '1.5rem' }}>
            {label}
          </Text>
        )}
      </div>
    </ButtonContainer>
  );
};
