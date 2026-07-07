import React, { FormEvent, useState } from 'react';
import { isSanctionedEmail, isValidEmail } from 'src/lib/validators';
import { Button, Text, TextInput, IcoEmail, IcoArrowRight } from '@magiclabs/ui-components';
import { RpcErrorMessage } from 'src/types';
import { useEmailLogin } from '../context/EmailLoginContext';
import { getExtensionInstance } from 'src/extension';

interface EmailInputProps {
  error?: string;
  isLoading?: boolean;
}

export const EmailInput = ({ error: externalError, isLoading }: EmailInputProps) => {
  const { startEmailLogin } = useEmailLogin();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(true);
  const config = getExtensionInstance().getConfig();
  const isDarkMode = config?.theme.themeColor === 'dark';

  // Use external error if available, otherwise fall back to local error
  const displayError = externalError || localError;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setLocalError(RpcErrorMessage.MalformedEmail);
      return;
    } else if (isSanctionedEmail(email)) {
      setLocalError(RpcErrorMessage.SanEmail);
      return;
    }

    setDisabled(true);
    startEmailLogin(email);
  };

  const handleInput = (e: string) => {
    setLocalError(null);
    setDisabled(!e.length);
    setEmail(e.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
      <div className="w-full max-w-[25rem]">
        <TextInput aria-label="email input" value={email} onChange={handleInput} placeholder="Email address">
          <TextInput.TypeIcon>
            <IcoEmail {...(isDarkMode ? { color: 'var(--color-ink-70)' } : {})} />
          </TextInput.TypeIcon>
          <TextInput.ActionIcon onClick={() => {}}>
            <Button
              aria-label="login-submit-button"
              variant="text"
              textStyle="neutral"
              disabled={disabled}
              validating={isLoading}
              type="submit"
            >
              <Button.LeadingIcon color="var(--color-text-tertiary)">
                <IcoArrowRight />
              </Button.LeadingIcon>
            </Button>
          </TextInput.ActionIcon>
        </TextInput>
      </div>
      {displayError && (
        <Text variant="error" size="sm" styles={{ textAlign: 'center' }}>
          {displayError}
        </Text>
      )}
    </form>
  );
};
