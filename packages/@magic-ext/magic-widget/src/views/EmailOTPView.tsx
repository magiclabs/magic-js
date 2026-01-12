import { Button, EmailWbr, IcoEmail, Text, VerifyPincode } from '@magiclabs/ui-components';
import React, { useEffect, useState } from 'react';
import { VStack } from '../../styled-system/jsx';
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
  const [showResendButton, setShowResendButton] = useState(false);
  const [otpRetries, setOtpRetries] = useState(3);

  const isVerifying = emailLoginStatus === 'verifying_otp';
  const isSuccess = emailLoginStatus === 'success';

  const onChangeOtp = () => {
    dispatch({ type: 'RESET_EMAIL_ERROR' });
  };

  useEffect(() => {
    console.log('emailLoginStatus', emailLoginStatus);
    if (emailLoginStatus === 'otp_sent') {
      setIsResending(false);
      setOtpRetries(3);
    }
    if (emailLoginStatus === 'invalid_otp') {
      const newOtpRetries = otpRetries - 1;
      setOtpRetries(newOtpRetries);
      setShowResendButton(newOtpRetries <= 0);
    }
    if (emailLoginStatus === 'expired_otp') {
      setShowResendButton(true);
    }
  }, [emailLoginStatus]);

  const handleResend = () => {
    setIsResending(true);
    resendEmailOTP();
    setShowResendButton(false);
  };

  return (
    <>
      <WidgetHeader onPressBack={cancelLogin} showHeaderText={false} />
      <VStack>
        <VStack gap={6}>
          <IcoEmail width={60} height={60} color={token('colors.brand.base')} />
          <VStack gap={0}>
            <Text.H4
              styles={{
                textAlign: 'center',
                fontWeight: 'normal',
              }}
            >
              Please enter the code sent to
            </Text.H4>
            <Text.H4
              styles={{
                textAlign: 'center',
              }}
            >
              {email && <EmailWbr email={email} />}
            </Text.H4>
          </VStack>
        </VStack>

        <VerifyPincode
          originName="email"
          pinLength={6}
          isPending={isVerifying || isResending}
          isSuccess={isSuccess}
          onChange={onChangeOtp}
          onComplete={submitOTP}
          errorMessage={isResending ? '' : (error ?? '')}
        >
          <VerifyPincode.RetryContent>
            {showResendButton && <Button variant="text" onPress={handleResend} label="Request a new code" />}
          </VerifyPincode.RetryContent>
        </VerifyPincode>
      </VStack>
    </>
  );
};
