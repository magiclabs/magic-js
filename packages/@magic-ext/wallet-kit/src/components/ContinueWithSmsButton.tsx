import { ButtonContainer, IcoMessage, IcoPhone, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Flex } from '@styled/jsx';
import { token } from '@styled/tokens';
import React from 'react';
import { getExtensionInstance } from '../extension';

export const ContinueWithSmsButton = ({ onClick }: { onClick: () => void }) => {
  const config = getExtensionInstance().getConfig();
  const isDarkMode = config?.theme.themeColor === 'dark';

  return (
    <Box flex={1}>
      <ButtonContainer
        onPress={onClick}
        borderRadius={14}
        className={css({
          w: 'full',
          px: 4,
          py: 3,
          bg: 'neutral.quaternary',
          _hover: { bg: 'neutral.tertiary' },
        })}
      >
        <Flex gap={3} w="full" justifyContent={'flex-start'} alignItems="center">
          <IcoPhone width={24} height={24} {...(isDarkMode ? { color: token('colors.ink.70') } : {})} />
          <Text styles={{ lineHeight: '1.5rem' }}>Continue with SMS</Text>
        </Flex>
      </ButtonContainer>
    </Box>
  );
};
