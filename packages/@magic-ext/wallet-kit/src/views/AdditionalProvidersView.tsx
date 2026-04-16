import React from 'react';
import { OAuthProvider } from 'src/types';
import { WidgetAction } from 'src/reducer';
import WidgetHeader from 'src/components/WidgetHeader';
import { VStack } from 'src/components/Stack';
import { ProviderButton } from 'src/components/ProviderButton';
import { OAUTH_METADATA, DARK_MODE_ICON_OVERRIDES } from 'src/constants';
import { getExtensionInstance } from 'src/extension';

interface AdditionalProvidersViewProps {
  dispatch: React.Dispatch<WidgetAction>;
}

export default function AdditionalProvidersView({ dispatch }: AdditionalProvidersViewProps) {
  const config = getExtensionInstance().getConfig();
  const isDarkMode = config?.theme.themeColor === 'dark';
  const socialProviders = (config?.authProviders?.social ?? []) as OAuthProvider[];

  const handleProviderLogin = (provider: OAuthProvider) => {
    dispatch({ type: 'SELECT_PROVIDER', provider });
  };

  const handlePressBack = () => {
    dispatch({ type: 'GO_TO_LOGIN' });
  };

  return (
    <>
      <WidgetHeader onPressBack={handlePressBack} showHeaderText={false} />
      <VStack className="w-full">
        <div
          className="mt-4 mb-2 w-full px-4 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent"
          style={{ scrollbarColor: 'rgba(143, 147, 153, 0.4) transparent' }}
        >
          <div className="flex flex-col gap-2 max-h-[384px] w-full px-2">
            {socialProviders.map(provider => (
              <ProviderButton
                key={provider}
                label={OAUTH_METADATA[provider].displayName}
                Icon={(isDarkMode && DARK_MODE_ICON_OVERRIDES[provider]) || OAUTH_METADATA[provider].Icon}
                onPress={() => handleProviderLogin(provider)}
              />
            ))}
          </div>
        </div>
      </VStack>
    </>
  );
}
