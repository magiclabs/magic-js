import React from 'react';
import { ProviderButton } from './ProviderButton';
import { OAUTH_METADATA } from '../constants';
import { OAuthProvider } from '../types';
import { IcoKebab } from '@magiclabs/ui-components';
import { css } from '../../styled-system/css';
import { HStack } from '../../styled-system/jsx';

interface SocialProvidersProps {
  providers: OAuthProvider[];
  onPress: (provider: OAuthProvider) => void;
}

const MAX_VISIBLE_PROVIDERS = 5;
const IcoEllipsis = () => <IcoKebab className={css({ rotate: '90deg' })} />;

export const SocialProviders = ({ providers, onPress }: SocialProvidersProps) => {
  const hasOverflow = providers.length > MAX_VISIBLE_PROVIDERS;
  const visibleProviders = hasOverflow ? providers.slice(0, MAX_VISIBLE_PROVIDERS - 1) : providers;
  const shouldHideLabel = providers.length > 1;

  const handlePressMore = () => {
    // TODO: Implement
  };

  return (
    <HStack gap={2} w="full">
      {visibleProviders.map(provider => (
        <ProviderButton
          key={provider}
          hideLabel={shouldHideLabel}
          label={`Continue with ${OAUTH_METADATA[provider].displayName}`}
          Icon={OAUTH_METADATA[provider].Icon}
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
