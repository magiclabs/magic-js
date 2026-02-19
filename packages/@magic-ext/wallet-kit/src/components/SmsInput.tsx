import React, { FormEvent, useState } from 'react';
import { Button, Text, IconSms, IcoArrowRight, PhoneInput } from '@magiclabs/ui-components';
import { RpcErrorMessage } from 'src/types';
import { useSmsLogin } from '../context/SmsLoginContext';
import { vstack } from '@styled/patterns';
import { Box, Flex } from '@styled/jsx';
import { token } from '@styled/tokens';
import { getExtensionInstance } from 'src/extension';
import { isValidPhoneNumber } from 'libphonenumber-js';

interface SmsInputProps {
  error?: string;
  isLoading?: boolean;
}

export const SmsInput = ({ error: externalError, isLoading }: SmsInputProps) => {
  const { startSmsLogin } = useSmsLogin();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(true);
  const config = getExtensionInstance().getConfig();

  const isPhoneValid = phoneNumber.length > 0 && isValidPhoneNumber(phoneNumber);

  // Use external error if available, otherwise fall back to local error
  const displayError = externalError || localError;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidPhoneNumber(phoneNumber)) {
      setLocalError(RpcErrorMessage.InvalidPhoneNumber);
      return;
    }

    setDisabled(true);
    startSmsLogin(phoneNumber);
  };

  const handleInput = (value: string) => {
    setLocalError(null);
    setDisabled(!value.length);
    setPhoneNumber(value.trim());
  };

  const handlePhoneChange = (phone: string) => {
    handleInput(phone);
  };

  return (
    <form onSubmit={handleSubmit} className={vstack({ w: 'full' })}>
      <Box w="full" maxW="25rem" style={{ position: 'relative' }}>
        <PhoneInput onChange={handlePhoneChange} autoFocus={false} errorMessage={undefined} />

        <Box
          style={{
            position: 'absolute',
            right: token('spacing.3'),
            top: '0',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            aria-label="login-submit-button"
            variant="text"
            textStyle="neutral"
            disabled={!isPhoneValid}
            validating={isLoading}
            type="submit"
          >
            <Button.LeadingIcon color={token('colors.text.tertiary')}>
              <IcoArrowRight />
            </Button.LeadingIcon>
          </Button>
        </Box>
      </Box>
      {displayError && (
        <Text variant="error" size="sm" styles={{ textAlign: 'center' }}>
          {displayError}
        </Text>
      )}
    </form>
  );
};
