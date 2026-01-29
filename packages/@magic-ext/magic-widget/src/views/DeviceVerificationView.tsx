import React, { useEffect } from 'react';
import { VStack, Box, HStack } from '@styled/jsx';
import { Text, IcoShield, IcoEdit } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { token } from '@styled/tokens';
import { useEmailLogin } from '../context/EmailLoginContext';
import { WidgetAction, WidgetState } from '../reducer';
import WidgetHeader from '../components/WidgetHeader';

interface DeviceVerificationViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const DeviceVerificationView = ({ state, dispatch }: DeviceVerificationViewProps) => {
  const { cancelLogin } = useEmailLogin();
  const { emailLoginStatus, email } = state;

  useEffect(() => {
    if (emailLoginStatus === 'device_approved') {
      dispatch({ type: 'EMAIL_OTP_SENT' });
    }
  }, [emailLoginStatus]);

  return (
    <>
      <WidgetHeader onPressBack={cancelLogin} showHeaderText={false} />
      <VStack gap={6}>
        <IcoShield width={60} height={60} color={token('colors.brand.base')} />
        <Text.H4
          styles={{
            textAlign: 'center',
          }}
        >
          Please register this device to continue.
        </Text.H4>

        <VStack gap={0}>
          <Text
            styles={{
              textAlign: 'center',
              lineHeight: 1.8,
            }}
          >
            We sent a device registration link to
          </Text>
          <HStack gap={2}>
            <Text
              styles={{
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              {email}
            </Text>
            <button className={css({ cursor: 'pointer' })} onClick={cancelLogin}>
              <IcoEdit height={18} width={18} color={token('colors.brand.base')} />
            </button>
          </HStack>
        </VStack>

        <Box mt={4}>
          <Text
            styles={{
              textAlign: 'center',
            }}
          >
            This quick one-time approval will help keep your account secure.
          </Text>
        </Box>
      </VStack>
    </>
  );
};
