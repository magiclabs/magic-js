import { Text } from '@magiclabs/ui-components';
import React from 'react';
import { ContinueWithSmsButton } from 'src/components/ContinueWithSmsButton';
import { ContinueWithPasskeyButton } from 'src/components/ContinueWithPasskeyButton';
import { EmailInput } from '../components/EmailInput';
import { ProviderButton } from '../components/ProviderButton';
import { SocialProviders } from '../components/SocialProviders';
import WidgetHeader from '../components/WidgetHeader';
import { WALLET_METADATA } from '../constants';
import { useWidgetConfig } from '../context/WidgetConfigContext';
import { getExtensionInstance } from '../extension';
import { WidgetAction, WidgetState } from '../reducer';
import { OAuthProvider, ThirdPartyWallet } from '../types';

interface LoginViewProps {
  dispatch: React.Dispatch<WidgetAction>;
  state: WidgetState;
}

export const LoginView = ({ dispatch, state }: LoginViewProps) => {
  const config = getExtensionInstance().getConfig();
  const { wallets, enableFarcaster } = useWidgetConfig();
  const { primary, social } = config?.authProviders ?? {};
  const hasEmailProvider = primary?.includes('email');
  const hasSmsProvider = primary?.includes('sms');
  const hasPasskeyProvider = primary?.includes('webauthn');
  const socialProviders = social?.map(provider => provider as OAuthProvider) ?? [];
  const hasAlternativeLogin = hasSmsProvider || hasPasskeyProvider;

  const showDivider =
    (hasEmailProvider || hasSmsProvider || socialProviders.length > 0 || enableFarcaster) && wallets.length > 0;

  const handleProviderSelect = (provider: ThirdPartyWallet) => {
    dispatch({ type: 'SELECT_WALLET', provider });
  };

  const handleProviderLogin = (provider: OAuthProvider) => {
    dispatch({ type: 'SELECT_PROVIDER', provider });
  };

  const handleSmsClick = () => {
    dispatch({ type: 'GO_TO_SMS_LOGIN' });
  };

  const handlePasskeyClick = () => {
    dispatch({ type: 'SELECT_PASSKEY' });
  };

  return (
    <>
      <WidgetHeader />
      <div className="flex flex-col items-center w-full gap-10 mt-2 px-7">
        {config?.theme.assetUri && <img src={config.theme.assetUri} alt="Logo" width={80} height={80} />}

        <div className="flex flex-col items-center w-full max-w-[25rem] gap-4">
          {hasEmailProvider && (
            <EmailInput
              error={state.loginMethod === 'email' ? state.error : undefined}
              isLoading={state.loginMethod === 'email' && state.otpLoginStatus === 'sending'}
            />
          )}

          {hasAlternativeLogin && (
            <div className="flex flex-col gap-2 w-full justify-center">
              {hasSmsProvider && <ContinueWithSmsButton onClick={handleSmsClick} />}
              {hasPasskeyProvider && <ContinueWithPasskeyButton onClick={handlePasskeyClick} />}
            </div>
          )}

          {(socialProviders.length > 0 || enableFarcaster) && (
            <SocialProviders
              providers={Object.values(socialProviders)}
              onPress={handleProviderLogin}
              dispatch={dispatch}
              enableFarcaster={enableFarcaster}
            />
          )}

          {showDivider && (
            <div className="flex flex-row items-center gap-2.5 mb-3 w-full">
              <div className="flex-1 h-px bg-surface-quaternary" />
              <Text aria-label="or" fontColor="text.tertiary">
                or
              </Text>
              <div className="flex-1 h-px bg-surface-quaternary" />
            </div>
          )}

          {wallets.length > 0 && (
            <div className={`flex ${showDivider ? 'flex-row' : 'flex-col'} gap-2 w-full justify-center items-center`}>
              {wallets.map(provider => (
                <ProviderButton
                  key={provider}
                  hideLabel={wallets.length > 1 && showDivider}
                  label={WALLET_METADATA[provider].displayName}
                  Icon={WALLET_METADATA[provider].Icon}
                  onPress={() => handleProviderSelect(provider)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
