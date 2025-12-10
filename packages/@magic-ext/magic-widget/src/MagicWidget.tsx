import { Button, Footer, Header, IcoDismiss, Modal, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '../styled-system/jsx';
import { token } from '../styled-system/tokens';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// The actual widget content
function WidgetContent() {
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

// Shadow DOM wrapper - encapsulates CSS completely
export function MagicWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.shadowRoot) {
      const shadow = containerRef.current.attachShadow({ mode: 'open' });

      // Inject CSS into shadow DOM
      const styleElement = document.createElement('style');
      // CSS will be injected at build time
      styleElement.textContent = MAGIC_WIDGET_CSS;
      shadow.appendChild(styleElement);

      // Create a container for React to render into
      const reactRoot = document.createElement('div');
      reactRoot.id = 'magic-widget-root';
      shadow.appendChild(reactRoot);

      setShadowRoot(shadow);
    }
  }, []);

  return (
    <div ref={containerRef}>
      {shadowRoot && createPortal(<WidgetContent />, shadowRoot.getElementById('magic-widget-root')!)}
    </div>
  );
}

// Placeholder - will be replaced with actual CSS at build time
declare const MAGIC_WIDGET_CSS: string;
