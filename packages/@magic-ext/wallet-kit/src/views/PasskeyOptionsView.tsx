import React from 'react';
import { Button, IcoFingerprint, Text } from '@magiclabs/ui-components';
import WidgetHeader from '../components/WidgetHeader';
import { WidgetAction } from '../reducer';

interface PasskeyOptionsViewProps {
  dispatch: React.Dispatch<WidgetAction>;
}

export const PasskeyOptionsView = ({ dispatch }: PasskeyOptionsViewProps) => {
  const handleLogin = () => {
    dispatch({ type: 'LOGIN_WITH_PASSKEY' });
  };

  const handleRegister = () => {
    dispatch({ type: 'REGISTER_PASSKEY' });
  };

  const handleBack = () => {
    dispatch({ type: 'GO_TO_LOGIN' });
  };

  return (
    <>
      <WidgetHeader onPressBack={handleBack} showHeaderText={false} />
      <div className="flex flex-col items-center gap-6 pt-4 px-7">
        <div className="flex flex-col items-center gap-6">
          <IcoFingerprint width={60} height={60} color="var(--color-brand-base)" />
          <div className="flex flex-col items-center gap-2">
            <Text.H4 styles={{ textAlign: 'center' }}>Sign in with passkey</Text.H4>
            <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
              Use your device's biometric authentication or security key
            </Text>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[25rem]">
          <Button label="Login with existing passkey" onPress={handleLogin} variant="primary" />
          <Button label="Register a new passkey" onPress={handleRegister} variant="secondary" />
        </div>
      </div>
    </>
  );
};
