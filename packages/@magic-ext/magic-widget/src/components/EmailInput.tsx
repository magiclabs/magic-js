import React, { FormEvent, useState } from 'react';
import { isSanctionedEmail, isValidEmail } from 'src/lib/validators';
import { Button, Text, TextInput, IcoEmail, IcoArrowRight } from '@magiclabs/ui-components';
import { Box } from '../../styled-system/jsx';
import { vstack } from '../../styled-system/patterns';
import { token } from '../../styled-system/tokens';
import { RpcErrorMessage } from 'src/types';

export const EmailInput = () => {
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError(RpcErrorMessage.MalformedEmail);
    } else {
      // TODO: Add logging, or handle errors on relayer side?
      if (isSanctionedEmail(email)) {
        setError(RpcErrorMessage.SanEmail);
        return;
      }
      setDisabled(true);
      setIsValidating(true);
    }
  };

  const handleInput = (e: string) => {
    setError(null);
    setDisabled(!e.length);
    setEmail(e.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={vstack({ w: 'full' })}>
      <Box
        style={{
          width: '100%',
          maxWidth: '25rem',
        }}
      >
        <TextInput aria-label="email input" value={email} onChange={handleInput} placeholder="Email address">
          <TextInput.TypeIcon>
            <IcoEmail />
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
