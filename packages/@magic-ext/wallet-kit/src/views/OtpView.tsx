import { Button, EmailWbr, IcoEmail, Text, VerifyPincode, IconSms } from '@magiclabs/ui-components';
import React, { useEffect, useState } from 'react';
import WidgetHeader from '../components/WidgetHeader';
import { useEmailLogin } from '../context/EmailLoginContext';
import { useSmsLogin } from '../context/SmsLoginContext';
import { WidgetAction, WidgetState } from '../reducer';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

interface OtpViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const OtpView = ({ state, dispatch }: OtpViewProps) => {
  const emailLogin = useEmailLogin();
  const smsLogin = useSmsLogin();
  const { otpLoginStatus, identifier, error, loginMethod } = state;
  const [isResending, setIsResending] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  const isSms = loginMethod === 'sms';
  const submitOTP = isSms ? smsLogin.submitOTP : emailLogin.submitOTP;
  const cancelLogin = isSms ? smsLogin.cancelLogin : emailLogin.cancelLogin;
  const resendOtp = isSms ? smsLogin.resendSmsOTP : emailLogin.resendEmailOTP;

  const isVerifying = otpLoginStatus === 'verifying_otp';
  const isSuccess = otpLoginStatus === 'success';

  const onChangeOtp = () => {
    dispatch({ type: 'RESET_OTP_ERROR' });
  };

  useEffect(() => {
    if (otpLoginStatus === 'otp_sent') {
      setIsResending(false);
    }
    if (otpLoginStatus === 'expired_otp' || otpLoginStatus === 'max_attempts_reached') {
      setShowResendButton(true);
    }
  }, [otpLoginStatus]);

  const handleResend = () => {
    setIsResending(true);
    resendOtp();
    setShowResendButton(false);
  };

  return (
    <>
      <WidgetHeader onPressBack={cancelLogin} showHeaderText={false} />
      <VStack>
        <VStack gap={6}>
          {isSms ? (
            <IconSms width={60} height={60} color={token('colors.brand.base')} />
          ) : (
            <IcoEmail width={60} height={60} color={token('colors.brand.base')} />
          )}
          <VStack gap={0}>
            <Text.H4
              fontWeight="normal"
              styles={{
                textAlign: 'center',
              }}
            >
              Please enter the code sent to
            </Text.H4>
            <Text.H4
              styles={{
                textAlign: 'center',
              }}
            >
              {identifier && (isSms ? identifier : <EmailWbr email={identifier} />)}
            </Text.H4>
          </VStack>
        </VStack>

        <VerifyPincode
          originName={isSms ? 'sms' : 'email'}
          pinLength={6}
          isPending={isVerifying || isResending}
          isSuccess={isSuccess}
          onChange={onChangeOtp}
          onComplete={submitOTP}
          errorMessage={isResending ? '' : error ?? ''}
        >
          <VerifyPincode.RetryContent>
            {showResendButton && <Button variant="text" onClick={handleResend} label="Request a new code" />}
          </VerifyPincode.RetryContent>
        </VerifyPincode>
      </VStack>
    </>
  );
};
