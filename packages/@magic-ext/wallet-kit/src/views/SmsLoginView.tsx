import { IcoPhone, LoadingSpinner, PhoneInput, Text } from '@magiclabs/ui-components';
import { Spacer, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { isValidPhoneNumber } from 'libphonenumber-js';
import React, { useState } from 'react';
import { RpcErrorMessage } from 'src/types';
import WidgetHeader from '../components/WidgetHeader';
import { useSmsLogin } from '../context/SmsLoginContext';
import { WidgetState } from '../reducer';

interface SmsLoginViewProps {
  state: WidgetState;
}

export const SmsLoginView = ({ state }: SmsLoginViewProps) => {
  const { cancelLogin, startSmsLogin } = useSmsLogin();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const isLoading = state.loginMethod === 'sms' && state.otpLoginStatus === 'sending';

  const disableSubmit = () => !(phoneNumber.length > 0 && isValidPhoneNumber(phoneNumber));
  const displayError = (state.loginMethod === 'sms' ? state.error : undefined) || localError || undefined;

  const handlePhoneChange = (phone: string) => {
    setLocalError(null);
    setPhoneNumber(phone.trim());
  };

  const handleSubmit = () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setLocalError(RpcErrorMessage.InvalidPhoneNumber);
      return;
    }
    startSmsLogin(phoneNumber);
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
        <VStack gap={10}>
          <IcoPhone width={60} height={60} color={token('colors.brand.base')} />
          <Text.H4
            fontWeight="medium"
            styles={{
              textAlign: 'center',
            }}
          >
            Enter phone number
          </Text.H4>
        </VStack>

        <PhoneInput
          onChange={handlePhoneChange}
          onSubmit={handleSubmit}
          disableSubmit={disableSubmit}
          containerStyles={{ width: '100%' }}
          errorMessage={displayError}
          showPlaceholder
        />
      </VStack>
    </>
  );
};
