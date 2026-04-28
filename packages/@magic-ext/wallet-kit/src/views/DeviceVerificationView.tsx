import React, { useEffect } from 'react';
import { Text, IcoShield, IcoEdit } from '@magiclabs/ui-components';
import { WidgetAction, WidgetState } from '../reducer';
import WidgetHeader from '../components/WidgetHeader';
import { useCancelLogin } from 'src/hooks/useCancelLogin';

interface DeviceVerificationViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const DeviceVerificationView = ({ state, dispatch }: DeviceVerificationViewProps) => {
  const { cancelLogin } = useCancelLogin();
  const { otpLoginStatus, identifier, loginMethod } = state;

  useEffect(() => {
    if (otpLoginStatus === 'device_approved') {
      dispatch({ type: 'OTP_SENT' });
    }
  }, [otpLoginStatus]);

  // For SMS login, device verification is done via SMS, not email
  const isSms = loginMethod === 'sms';

  return (
    <>
      <WidgetHeader onPressBack={cancelLogin} showHeaderText={false} />
      <div className="flex flex-col items-center gap-6">
        <IcoShield width={60} height={60} color="var(--color-brand-base)" />
        <Text.H4
          styles={{
            textAlign: 'center',
          }}
        >
          Please register this device to continue.
        </Text.H4>

        <div className="flex flex-col items-center gap-0">
          <Text
            styles={{
              textAlign: 'center',
              lineHeight: 1.8,
            }}
          >
            We sent a device registration link to
          </Text>
          <div className="flex flex-row items-center gap-2">
            <Text
              styles={{
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              {isSms ? 'your phone' : identifier}
            </Text>
            <button className="cursor-pointer" onClick={cancelLogin}>
              <IcoEdit height={18} width={18} color="var(--color-brand-base)" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <Text
            styles={{
              textAlign: 'center',
            }}
          >
            This quick one-time approval will help keep your account secure.
          </Text>
        </div>
      </div>
    </>
  );
};
