import { ButtonContainer, IcoFingerprint, LoadingSpinner, Text, TextInput } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Flex, Spacer, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import React, { useState } from 'react';
import WidgetHeader from '../components/WidgetHeader';
import { useWebAuthnLogin } from '../context/WebAuthnLoginContext';
import { WidgetState } from '../reducer';

interface WebAuthnLoginViewProps {
  state: WidgetState;
}

export const WebAuthnLoginView = ({ state }: WebAuthnLoginViewProps) => {
  const { startWebAuthnLogin, registerNewWebAuthnUser, cancelLogin } = useWebAuthnLogin();
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const isLoading = state.loginMethod === 'webauthn' && state.otpLoginStatus === 'sending';

  const displayError = state.error || localError;

  const handleInput = (value: string) => {
    setLocalError(null);
    setUsername(value.trim());
  };

  const isUsernameValid = username.trim().length > 0;

  const handleLogin = () => {
    if (isUsernameValid) {
      startWebAuthnLogin(username.trim());
    } else {
      setLocalError('Username is required');
    }
  };

  const handleRegister = () => {
    if (isUsernameValid) {
      registerNewWebAuthnUser(username.trim());
    } else {
      setLocalError('Username is required');
    }
  };

  if (isLoading) {
    return (
      <>
        <WidgetHeader onPressBack={cancelLogin} />
        <Spacer size={'2'} />
        <LoadingSpinner size={60} strokeWidth={6} neutral />
      </>
    );
  }

  return (
    <>
      <WidgetHeader onPressBack={cancelLogin} />
      <VStack w="full" gap={10} mt={2} px={7}>
        <VStack gap={4}>
          <IcoFingerprint width={60} height={60} color={token('colors.ink.70')} />
          <Text.H4
            fontWeight="normal"
            styles={{
              textAlign: 'center',
            }}
          >
            Please signup or login
          </Text.H4>
        </VStack>

        <VStack gap={2} w="full" alignItems="stretch">
          <TextInput
            aria-label="webauthn username input"
            value={username}
            onChange={handleInput}
            placeholder="Username or email"
          />
          {displayError && (
            <Text variant="error" size="sm" styles={{ textAlign: 'center' }}>
              {displayError}
            </Text>
          )}
        </VStack>

        <Flex gap={2} w="full">
          <ButtonContainer
            onPress={handleLogin}
            borderRadius={14}
            className={css({
              w: 'full',
              px: 4,
              py: 3,
              bg: 'neutral.primary',
              _hover: { bg: 'neutral.tertiary' },
              _disabled: { opacity: 0.5 },
            })}
            disabled={!isUsernameValid || isLoading}
          >
            <Flex gap={3} w="full" justifyContent={'center'} alignItems="center">
              <Text fontWeight="medium" styles={{ lineHeight: '1.5rem' }}>
                Login
              </Text>
            </Flex>
          </ButtonContainer>

          <ButtonContainer
            onPress={handleRegister}
            borderRadius={14}
            className={css({
              w: 'full',
              px: 4,
              py: 3,
              bg: 'neutral.primary',
              _hover: { bg: 'neutral.tertiary' },
              _disabled: { opacity: 0.5 },
            })}
            disabled={!isUsernameValid || isLoading}
          >
            <Flex gap={3} w="full" justifyContent={'center'} alignItems="center">
              <Text fontWeight="medium" styles={{ lineHeight: '1.5rem' }}>
                Register
              </Text>
            </Flex>
          </ButtonContainer>
        </Flex>
      </VStack>
    </>
  );
};
