import { Button, IcoEmail, LoadingSpinner, Text, VerifyPincode } from '@magiclabs/ui-components';
import React, { useEffect, useState } from 'react';
import { Box, VStack } from '../../styled-system/jsx';
import { token } from '../../styled-system/tokens';
import WidgetHeader from '../components/WidgetHeader';
import { useEmailLogin } from '../context/EmailLoginContext';
import { WidgetAction, WidgetState } from '../reducer';

interface EmailOTPViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const EmailOTPView = ({ state, dispatch }: EmailOTPViewProps) => {
  const { submitOTP, cancelLogin, resendEmailOTP } = useEmailLogin();
  const { emailLoginStatus, email, error } = state;
  const [isResending, setIsResending] = useState(false);

  const isVerifying = emailLoginStatus === 'verifying_otp';
  const isSuccess = emailLoginStatus === 'success';

  const onChangeOtp = () => {
    dispatch({ type: 'RESET_EMAIL_ERROR' });
  };

  useEffect(() => {
    if (emailLoginStatus === 'otp_sent') {
      setIsResending(false);
    }
  }, [emailLoginStatus]);

  const onResend = () => {
    setIsResending(true);
    resendEmailOTP();
  };

  return (
    <>
      <WidgetHeader onPressBack={cancelLogin} showHeaderText={false} />
      <VStack gap={6} pt={4} px={6} alignItems="center">
        {/* Icon */}
        <Box position="relative" h={20} w={20} display="flex" alignItems="center" justifyContent="center">
          {isVerifying || isResending ? (
            <LoadingSpinner size={80} strokeWidth={8} neutral progress={40} />
          ) : (
            <Box
              w={16}
              h={16}
              borderRadius="full"
              bg="brand.lightest"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <IcoEmail width={32} height={32} color={token('colors.brand.base')} />
            </Box>
          )}
        </Box>

        {/* Title and description */}
        <VStack gap={1} alignItems="center" w="full">
          <Text.H4 styles={{ textAlign: 'center' }}>Check your email</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            Enter the 6-digit code sent to
          </Text>
          <Box w="full" style={{ wordBreak: 'break-word' }}>
            <Text fontWeight="semibold" styles={{ textAlign: 'center' }}>
              {email}
            </Text>
          </Box>
        </VStack>

        <VerifyPincode
          originName="email"
          pinLength={6}
          isPending={false} // we show loading spinner in the header
          isSuccess={isSuccess}
          onChange={onChangeOtp}
          onComplete={submitOTP}
          errorMessage={isResending ? '' : (error ?? '')}
        />

        {/* Resend button */}
        <VStack gap={1} alignItems="center">
          <Text fontColor="text.tertiary" size="sm">
            Didn't receive a code?
          </Text>
          <Button
            label="Resend"
            variant="text"
            textStyle="neutral"
            onPress={onResend}
            disabled={isVerifying || isResending}
            size="sm"
          />
        </VStack>
      </VStack>
    </>
  );
};
