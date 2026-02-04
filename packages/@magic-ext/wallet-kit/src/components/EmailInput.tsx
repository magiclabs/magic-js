import React, { FormEvent, useState } from 'react';
import { isSanctionedEmail, isValidEmail } from 'src/lib/validators';
import { Button, Text, TextInput, IcoEmail, IcoArrowRight } from '@magiclabs/ui-components';
import { RpcErrorMessage } from 'src/types';
import { useEmailLogin } from '../context/EmailLoginContext';
import { vstack } from '@styled/patterns';
import { Box } from '@styled/jsx';
import { token } from '@styled/tokens';
import { getExtensionInstance } from 'src/extension';

export const EmailInput = () => {
  const { startEmailLogin } = useEmailLogin();
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(true);
  const config = getExtensionInstance().getConfig();
  const isDarkMode = config?.theme.themeColor === 'dark';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setError(RpcErrorMessage.MalformedEmail);
      return;
    } else if (isSanctionedEmail(email)) {
      setError(RpcErrorMessage.SanEmail);
      return;
    }

    setDisabled(true);
    setIsValidating(true);
    startEmailLogin(email);
  };

  const handleInput = (e: string) => {
    setError(null);
    setDisabled(!e.length);
    setEmail(e.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={vstack({ w: 'full' })}>
      <Box w="full" maxW="25rem">
        <TextInput aria-label="email input" value={email} onChange={handleInput} placeholder="Email address">
          <TextInput.TypeIcon>
            <IcoEmail {...(isDarkMode ? { color: token('colors.ink.70') } : {})} />
          </TextInput.TypeIcon>
          <TextInput.ActionIcon onClick={() => {}}>
            <Button
              aria-label="login-submit-button"
              variant="text"
              textStyle="neutral"
              disabled={disabled}
              validating={isValidating}
              type="submit"
            >
              <Button.LeadingIcon color={token('colors.text.tertiary')}>
                <IcoArrowRight />
              </Button.LeadingIcon>
            </Button>
          </TextInput.ActionIcon>
        </TextInput>
      </Box>
      {error && (
        <Text variant="error" size="sm" styles={{ textAlign: 'center' }}>
          {error}
        </Text>
      )}
    </form>
  );
};
