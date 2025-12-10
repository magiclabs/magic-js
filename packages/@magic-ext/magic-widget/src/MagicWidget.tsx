import { Button, Footer, Header, IcoDismiss, Modal, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '../styled-system/jsx';
import { token } from '../styled-system/tokens';
import React from 'react';

export function MagicWidget() {
  return (
    <Modal>
      <VStack alignItems="center" width="full">
        <Header position="relative">
          <Header.Content>
            <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
              App Name
            </Text>
          </Header.Content>
          <Header.RightAction>
            <Button variant="neutral" size="sm">
              <Button.LeadingIcon>
                <IcoDismiss />
              </Button.LeadingIcon>
            </Button>
          </Header.RightAction>
          <Header.Content>
            <Text.H3>Header</Text.H3>
          </Header.Content>
        </Header>
        <Text size="lg">This is a content message.</Text>
        <Footer />
      </VStack>
    </Modal>
  );
}
