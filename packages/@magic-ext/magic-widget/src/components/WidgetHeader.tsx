import React from 'react';
import { Button, Header, IcoArrowLeft, IcoDismiss, Page, Text } from '@magiclabs/ui-components';
import { useWidgetConfig } from '../context/WidgetConfigContext';

type WidgetHeaderProps = {
  showHeaderText?: boolean;
  onPressBack?: () => void;
};

export default function WidgetHeader({ showHeaderText = true, onPressBack }: WidgetHeaderProps) {
  const { handleClose } = useWidgetConfig();

  return (
    <Header position="relative">
      {!!onPressBack && (
        <Header.LeftAction>
          <Button size="sm" variant="neutral" onPress={onPressBack}>
            <Button.LeadingIcon>
              <IcoArrowLeft />
            </Button.LeadingIcon>
          </Button>
        </Header.LeftAction>
      )}
      {showHeaderText && (
        <Header.Content>
          <Text size="sm" fontColor="text.tertiary">
            Log in or sign up
          </Text>
        </Header.Content>
      )}
      {handleClose && (
        <Header.RightAction>
          <Button size="sm" variant="neutral" onPress={handleClose}>
            <Button.TrailingIcon>
              <IcoDismiss />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      )}
    </Header>
  );
}
