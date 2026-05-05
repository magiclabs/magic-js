import { IcoFingerprint, Text, TextInput, Button, IcoArrowRight } from '@magiclabs/ui-components';
import React, { FormEvent, useState } from 'react';
import WidgetHeader from '../components/WidgetHeader';
import { WidgetAction } from '../reducer';

interface PasskeyRegisterViewProps {
  dispatch: React.Dispatch<WidgetAction>;
}

export const PasskeyRegisterView = ({ dispatch }: PasskeyRegisterViewProps) => {
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleUsernameChange = (value: string) => {
    setLocalError(null);
    setUsername(value.trim());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Username is optional, but if provided, must be valid
    if (username && username.length < 3) {
      setLocalError('Username must be at least 3 characters');
      return;
    }
    if (username && username.length > 50) {
      setLocalError('Username must be less than 50 characters');
      return;
    }

    // Submit with username (or undefined if empty)
    dispatch({ type: 'PASSKEY_REGISTER_SUBMIT', username: username || undefined });
  };

  const handleBack = () => {
    dispatch({ type: 'SELECT_PASSKEY' });
  };

  const handleSkip = () => {
    dispatch({ type: 'PASSKEY_REGISTER_SUBMIT', username: undefined });
  };

  return (
    <>
      <WidgetHeader onPressBack={handleBack} />
      <div className="flex flex-col items-center w-full gap-10 mt-2 px-7">
        <div className="flex flex-col items-center gap-6">
          <IcoFingerprint width={60} height={60} color="var(--color-brand-base)" />
          <div className="flex flex-col items-center gap-2">
            <Text.H4 fontWeight="medium" styles={{ textAlign: 'center' }}>
              Register a new passkey
            </Text.H4>
            <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
              Choose a username for your passkey (optional)
            </Text>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full gap-4">
          <div className="w-full max-w-[25rem]">
            <TextInput
              aria-label="username input"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter username"
            >
              <TextInput.ActionIcon onClick={() => {}}>
                <Button
                  aria-label="passkey-register-submit-button"
                  variant="text"
                  textStyle="neutral"
                  type="submit"
                >
                  <Button.LeadingIcon color="var(--color-text-tertiary)">
                    <IcoArrowRight />
                  </Button.LeadingIcon>
                </Button>
              </TextInput.ActionIcon>
            </TextInput>
          </div>
          {localError && (
            <Text variant="error" size="sm" styles={{ textAlign: 'center' }}>
              {localError}
            </Text>
          )}
          <Button
            label="Skip"
            onPress={handleSkip}
            variant="text"
            textStyle="neutral"
            size="sm"
          />
        </form>
      </div>
    </>
  );
};
