import { Button, Callout, IcoLockLocked, LoadingSpinner, Text, TextInput } from '@magiclabs/ui-components';
import { Center, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import React, { useEffect } from 'react';
import WidgetHeader from '../components/WidgetHeader';
import { useEmailLogin } from '../context';
import { WidgetAction, WidgetState } from '../reducer';

interface RecoveryCodeViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const RecoveryCodeView = ({ state, dispatch }: RecoveryCodeViewProps) => {
  const { submitRecoveryCode } = useEmailLogin();
  const { emailLoginStatus, error } = state;

  const isVerifying = emailLoginStatus === 'recovery_code_verifying';
  const isSuccess = emailLoginStatus === 'success';

  useEffect(() => {
    if (isSuccess) {
      dispatch({ type: 'LOGIN_SUCCESS' });
    }
  }, [isSuccess]);

  const onChangeOtp = (recoveryCode: string) => {
    dispatch({ type: 'RESET_EMAIL_ERROR' });

    if (recoveryCode.length === 8) {
      submitRecoveryCode(recoveryCode);
    }
  };

  const onLostRecoveryCode = () => {
    dispatch({ type: 'LOST_RECOVERY_CODE' });
  };

  const handleBack = () => {
    dispatch({ type: 'MFA_REQUIRED' });
  };

  return (
    <>
      <WidgetHeader onPressBack={handleBack} showHeaderText={false} />
      <VStack>
        <VStack gap={6}>
          <IcoLockLocked width={60} height={60} color={token('colors.brand.base')} />
          <Text.H4 styles={{ textAlign: 'center', fontWeight: 'normal' }}>Enter your recovery code to log in.</Text.H4>
        </VStack>

        {isVerifying ? (
          <Center h={12}>
            <LoadingSpinner size={36} strokeWidth={4} />
          </Center>
        ) : (
          <>
            <TextInput
              aria-label="8-character code"
              attr={{
                size: 35,
              }}
              placeholder="8-character code"
              onChange={onChangeOtp}
              alignText="center"
              errorMessage={error ?? ''}
              disabled={isVerifying}
            />
            <Callout label="Two-Factor Authentication will be disabled." variant="warning" />
          </>
        )}

        {!isVerifying && !isSuccess && (
          <Button
            label="I lost my recovery code"
            variant="text"
            textStyle="neutral"
            onPress={onLostRecoveryCode}
            disabled={isVerifying || isSuccess}
            size="sm"
          />
        )}
      </VStack>
    </>
  );
};
