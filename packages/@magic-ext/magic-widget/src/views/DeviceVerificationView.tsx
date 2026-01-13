import React from 'react';
import { VStack, Box } from '../../styled-system/jsx';
import { Text, Button, IcoShield, LoadingSpinner, IcoCheckmarkCircleFill } from '@magiclabs/ui-components';
import { css } from '../../styled-system/css';
import { token } from '../../styled-system/tokens';
import { useEmailLogin } from '../context/EmailLoginContext';
import { WidgetState } from '../reducer';
import WidgetHeader from '../components/WidgetHeader';

interface DeviceVerificationViewProps {
  state: WidgetState;
}

const iconContainerStyle = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const DeviceVerificationView = ({ state }: DeviceVerificationViewProps) => {
  const { cancelLogin, retryDeviceVerification } = useEmailLogin();
  const { emailLoginStatus, email, error } = state;

  const isWaiting = emailLoginStatus === 'device_needs_approval' || emailLoginStatus === 'device_verification_sent';
  const isApproved = emailLoginStatus === 'device_approved';
  const isExpired = emailLoginStatus === 'device_verification_expired';

  const getTitle = () => {
    if (isApproved) return 'Device Approved';
    if (isExpired) return 'Link Expired';
    return 'Verify Your Device';
  };

  const getDescription = () => {
    if (isApproved) {
      return '"Device approved. Returning to login..."';
    }
    if (isExpired) {
      return 'The verification link has expired. Please request a new one.';
    }
    return "We don't recognize this device. Please check your email to approve this login.";
  };

  return (
    <>
      <WidgetHeader onPressBack={cancelLogin} showHeaderText={false} />
      <VStack gap={6} pt={4} alignItems="center" px={4}>
        <Box position="relative" h={20} w={20}>
          {isWaiting && <LoadingSpinner size={80} strokeWidth={8} neutral progress={40} />}
          <Box className={iconContainerStyle}>
            {isApproved ? (
              <IcoCheckmarkCircleFill width={36} height={36} color={token('colors.positive.base')} />
            ) : (
              <IcoShield width={36} height={36} color={token('colors.brand.base')} />
            )}
          </Box>
        </Box>

        <VStack gap={2} alignItems="center">
          <Text.H4>{getTitle()}</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center', maxWidth: '300px' }}>
            {getDescription()}
          </Text>
          {email && isWaiting && (
            <Text fontWeight="semibold" styles={{ textAlign: 'center' }}>
              {email}
            </Text>
          )}
        </VStack>

        {error && !isExpired ? (
          <Text variant="error" size="sm" styles={{ textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}

        {isExpired && (
          <VStack gap={3} w="full" maxW="300px">
            <Button variant="primary" label="Resend Verification" onPress={retryDeviceVerification} />
            <Button variant="tertiary" textStyle="neutral" label="Back to Login" onPress={cancelLogin} />
          </VStack>
        )}

        {isWaiting && (
          <VStack gap={2} alignItems="center">
            <Text fontColor="text.quaternary" size="sm" styles={{ textAlign: 'center' }}>
              Waiting for approval...
            </Text>
            <Button variant="text" size="sm" label="Cancel" textStyle="neutral" onPress={cancelLogin} />
          </VStack>
        )}
      </VStack>
    </>
  );
};
