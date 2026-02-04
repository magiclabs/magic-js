import React from 'react';
import { ProviderButton } from './ProviderButton';
import { OAUTH_METADATA, DARK_MODE_ICON_OVERRIDES } from '../constants';
import { OAuthProvider } from '../types';
import { IcoKebab } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack } from '@styled/jsx';
import { WidgetAction } from 'src/reducer';
import { getExtensionInstance } from 'src/extension';

interface SocialProvidersProps {
  providers: OAuthProvider[];
  onPress: (provider: OAuthProvider) => void;
  dispatch: React.Dispatch<WidgetAction>;
}

const MAX_VISIBLE_PROVIDERS = 5;
const IcoEllipsis = () => <IcoKebab className={css({ rotate: '90deg' })} />;

export const SocialProviders = ({ providers, onPress, dispatch }: SocialProvidersProps) => {
  const config = getExtensionInstance().getConfig();
  const isDarkMode = config?.theme.themeColor === 'dark';
  const hasOverflow = providers.length > MAX_VISIBLE_PROVIDERS;
  const visibleProviders = hasOverflow ? providers.slice(0, MAX_VISIBLE_PROVIDERS - 1) : providers;
  const shouldHideLabel = providers.length > 1;

  const handlePressMore = () => {
    dispatch({ type: 'GO_TO_ADDITIONAL_PROVIDERS' });
  };

  return (
    <HStack gap={2} w="full">
      {visibleProviders.map(provider => (
        <ProviderButton
          key={provider}
          hideLabel={shouldHideLabel}
          label={`Continue with ${OAUTH_METADATA[provider].displayName}`}
          Icon={(isDarkMode && DARK_MODE_ICON_OVERRIDES[provider]) || OAUTH_METADATA[provider].Icon}
          onPress={() => onPress(provider)}
        />
      ))}
      {hasOverflow && (
        <ProviderButton
          key="more-providers"
          hideLabel={shouldHideLabel}
          label="More options"
          Icon={IcoEllipsis}
          onPress={handlePressMore}
        />
      )}
    </HStack>
  );
};
