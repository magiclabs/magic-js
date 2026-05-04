import React, { useEffect, useRef } from 'react';
import { WidgetAction, WidgetState } from '../reducer';
import { Pending } from '../components/Pending';
import { usePasskeyLogin } from '../context/PasskeyLoginContext';
import { IcoFingerprint } from '@magiclabs/ui-components';

interface PasskeyPendingViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const PasskeyPendingView = ({ state, dispatch }: PasskeyPendingViewProps) => {
  const { startPasskeyLogin, startPasskeyRegister } = usePasskeyLogin();
  const actionAttempted = useRef(false);
  const hasError = state.otpLoginStatus === 'error';
  const errorMessage = state.error ?? null;
  const isRegister = state.passkeyAction === 'register';

  useEffect(() => {
    if (!actionAttempted.current) {
      actionAttempted.current = true;
      if (isRegister) {
        startPasskeyRegister();
      } else {
        startPasskeyLogin();
      }
    }
  }, [startPasskeyLogin, startPasskeyRegister, isRegister]);

  return (
    <Pending
      onPressBack={() => dispatch({ type: 'GO_TO_LOGIN' })}
      title={isRegister ? 'Register passkey' : 'Sign in with passkey'}
      description={
        isRegister
          ? 'Follow your device prompts to create a new passkey.'
          : "Use your device's biometric authentication or security key to continue."
      }
      Icon={IcoFingerprint}
      isPending={!hasError}
      errorMessage={hasError ? errorMessage : null}
    />
  );
};
