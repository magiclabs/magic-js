import React, { useState } from 'react';
import { getProviderConfig } from '../lib/provider-config';
import { WidgetAction } from '../reducer';
import { OAuthProvider } from '../types';
import { Pending } from 'src/components/Pending';

interface OAuthPendingViewProps {
  provider: OAuthProvider;
  dispatch: React.Dispatch<WidgetAction>;
}

export const OAuthPendingView = ({ provider, dispatch }: OAuthPendingViewProps) => {
  const { title, description, Icon } = getProviderConfig(provider);
  const [localError, setLocalError] = useState<string | null>(null);

  const isPending = !localError;

  return (
    <Pending
      onPressBack={() => dispatch({ type: 'GO_TO_LOGIN' })}
      title={title}
      description={description}
      Icon={Icon}
      isPending={isPending}
      errorMessage={localError}
    />
  );
};
