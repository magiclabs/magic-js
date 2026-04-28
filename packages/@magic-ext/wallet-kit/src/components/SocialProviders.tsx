import React from 'react';
import { ProviderButton } from './ProviderButton';
import { OAUTH_METADATA, DARK_MODE_ICON_OVERRIDES, FARCASTER_METADATA } from '../constants';
import { OAuthProvider } from '../types';
import { IcoKebab } from '@magiclabs/ui-components';
import { WidgetAction } from 'src/reducer';
import { getExtensionInstance } from 'src/extension';

interface SocialProvidersProps {
  providers: OAuthProvider[];
  onPress: (provider: OAuthProvider) => void;
  dispatch: React.Dispatch<WidgetAction>;
  enableFarcaster?: boolean;
}

const MAX_VISIBLE_PROVIDERS = 5;
const IcoEllipsis = () => <IcoKebab className="rotate-90" />;

export const SocialProviders = ({ providers, onPress, dispatch, enableFarcaster }: SocialProvidersProps) => {
  const config = getExtensionInstance().getConfig();
  const isDarkMode = config?.theme.themeColor === 'dark';
  const totalProviders = providers.length + (enableFarcaster ? 1 : 0);
  const hasOverflow = totalProviders > MAX_VISIBLE_PROVIDERS;
  const maxOAuthVisible = hasOverflow ? MAX_VISIBLE_PROVIDERS - 1 - (enableFarcaster ? 1 : 0) : providers.length;
  const visibleProviders = providers.slice(0, maxOAuthVisible);
  const shouldHideLabel = totalProviders > 1;

  const handlePressMore = () => {
    dispatch({ type: 'GO_TO_ADDITIONAL_PROVIDERS' });
  };

  return (
    <div className="flex flex-row items-center gap-2 w-full">
      {visibleProviders.map(provider => (
        <ProviderButton
          key={provider}
          hideLabel={shouldHideLabel}
          label={`Continue with ${OAUTH_METADATA[provider].displayName}`}
          Icon={(isDarkMode && DARK_MODE_ICON_OVERRIDES[provider]) || OAUTH_METADATA[provider].Icon}
          onPress={() => onPress(provider)}
        />
      ))}
      {enableFarcaster && (
        <ProviderButton
          key="farcaster"
          hideLabel={shouldHideLabel}
          label={`Continue with ${FARCASTER_METADATA.displayName}`}
          Icon={FARCASTER_METADATA.Icon}
          onPress={() => dispatch({ type: 'SELECT_FARCASTER' })}
        />
      )}
      {hasOverflow && (
        <ProviderButton
          key="more-providers"
          hideLabel={shouldHideLabel}
          label="More options"
          Icon={IcoEllipsis}
          onPress={handlePressMore}
        />
      )}
    </div>
  );
};
