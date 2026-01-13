import { Button, IcoLockLocked, Text, VerifyPincode } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import React from 'react';
import WidgetHeader from 'src/components/WidgetHeader';
import { useEmailLogin } from 'src/context';
import { WidgetAction, WidgetState } from 'src/reducer';

interface MFAViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const MFAView = ({ state, dispatch }: MFAViewProps) => {
  const { submitMFA, cancelLogin, lostDevice } = useEmailLogin();
  const { emailLoginStatus, error } = state;

  const isVerifying = emailLoginStatus === 'mfa_verifying';
  const isSuccess = emailLoginStatus === 'success';

  const onChangeOtp = () => {
    dispatch({ type: 'RESET_EMAIL_ERROR' });
  };

  return (
    <>
      <WidgetHeader onPressBack={cancelLogin} showHeaderText={false} />
      <VStack gap={6}>
        <IcoLockLocked width={60} height={60} color={token('colors.brand.base')} />

        <VStack gap={1} alignItems="center" w="full">
          <Box w="full" style={{ wordBreak: 'break-word' }}>
            <Text.H4 styles={{ textAlign: 'center', fontWeight: 'normal' }}>
              Please enter the 6-digit code from your authenticator app.
            </Text.H4>
          </Box>
        </VStack>

        <VerifyPincode
          originName="mfa"
          pinLength={6}
          isPending={isVerifying}
          isSuccess={isSuccess}
          onChange={onChangeOtp}
          onComplete={submitMFA}
          errorMessage={error ?? ''}
        />

        <VStack gap={2} alignItems="center">
          <Button
            label="I lost my device"
            variant="text"
            textStyle="neutral"
            onPress={lostDevice}
            disabled={isVerifying}
            size="sm"
          />
        </VStack>
      </VStack>
    </>
  );
};
