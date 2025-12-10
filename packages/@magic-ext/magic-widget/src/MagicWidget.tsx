import { Button, Footer, Header, IcoDismiss, Modal, Text } from '@magiclabs/ui-components';
import { VStack } from '../styled-system/jsx';
import { token } from '../styled-system/tokens';
import React, { useEffect, useRef } from 'react';

// Inject CSS into document head (only once)
let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;

  const styleElement = document.createElement('style');
  styleElement.id = 'magic-widget-styles';
  styleElement.textContent = MAGIC_WIDGET_CSS;
  document.head.appendChild(styleElement);
  cssInjected = true;
}

// The actual widget content
function WidgetContent() {
  const handleClick = () => {
    console.log('Button clicked!');
    alert('Hello World!');
  };

  return (
    <Modal>
      <VStack alignItems="center" width="full">
        <Header position="relative">
          <Header.Content>
            <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
              Header
            </Text>
          </Header.Content>
          <Header.RightAction>
            <Button variant="neutral" size="sm">
              <Button.LeadingIcon>
                <IcoDismiss />
              </Button.LeadingIcon>
            </Button>
          </Header.RightAction>
        </Header>
        <Text size="lg">This is a content message.</Text>
        <Button label="Click me" onPress={handleClick} />
        <Footer />
      </VStack>
    </Modal>
  );
}

// Main widget component
export function MagicWidget() {
  useEffect(() => {
    injectCSS();
  }, []);

  return (
    <div id="magic-widget-container">
      <WidgetContent />
    </div>
  );
}

// Placeholder - will be replaced with actual CSS at build time
declare const MAGIC_WIDGET_CSS: string;
