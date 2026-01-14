import { Button, Callout, IcoLockLocked, LoadingSpinner, Text, TextInput } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import React from 'react';
import WidgetHeader from 'src/components/WidgetHeader';
import { useEmailLogin } from 'src/context';
import { WidgetAction, WidgetState } from 'src/reducer';

interface RecoveryCodeViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

const iconContainerStyle = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const RecoveryCodeView = ({ state, dispatch }: RecoveryCodeViewProps) => {
  const { submitRecoveryCode } = useEmailLogin();
  const { emailLoginStatus, error } = state;

  const isVerifying = emailLoginStatus === 'recovery_code_verifying';

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

      <VStack gap={6} pt={4} px={6} alignItems="center">
        <Box position="relative" h={20} w={20}>
          {isVerifying && <LoadingSpinner size={80} strokeWidth={8} neutral progress={40} />}
          <Box className={iconContainerStyle}>
            <IcoLockLocked width={32} height={32} color={token('colors.brand.base')} />
          </Box>
        </Box>

        {/* Title and description */}
        <VStack gap={1} alignItems="center" w="full">
          <Box w="full" style={{ wordBreak: 'break-word' }}>
            <Text.H4 styles={{ textAlign: 'center', fontWeight: 'normal' }}>
              Enter your recovery code to log in.
            </Text.H4>
          </Box>
        </VStack>

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

        <VStack gap={2} alignItems="center">
          <Button
            label="I lost my recovery code"
            variant="text"
            textStyle="neutral"
            onPress={onLostRecoveryCode}
            disabled={isVerifying}
            size="sm"
          />
        </VStack>
      </VStack>
    </>
  );
};
