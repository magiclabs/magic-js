import { ButtonContainer, IcoPhone, Text } from '@magiclabs/ui-components';
import React from 'react';
import { getExtensionInstance } from '../extension';

export const ContinueWithSmsButton = ({ onClick }: { onClick: () => void }) => {
  const config = getExtensionInstance().getConfig();
  const isDarkMode = config?.theme.themeColor === 'dark';

  return (
    <div className="flex-1">
      <ButtonContainer
        onPress={onClick}
        borderRadius={14}
        className="w-full px-4 py-3 bg-neutral-quaternary hover:bg-neutral-tertiary"
      >
        <div className="flex flex-row items-center gap-3 w-full justify-start">
          <IcoPhone width={24} height={24} {...(isDarkMode ? { color: '#77767A' } : {})} />
          <Text styles={{ lineHeight: '1.5rem' }}>Continue with SMS</Text>
        </div>
      </ButtonContainer>
    </div>
  );
};
