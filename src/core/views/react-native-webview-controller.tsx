import React, { useState, useCallback, useMemo } from 'react';
import { MagicIncomingWindowMessage } from '../../types';
import { PayloadTransport } from '../payload-transport';
import { webSafeImports } from '../../web-safe-imports';

/*

  IMPORTANT NOTE:
  ~~~~~~~~~~~~~~

  Do not reference any React dependencies at the top-level of this file! Only
  use these dependencies within a closure (such as the body of a class method or
  function). We completely remove React dependencies from CJS and CDN bundles,
  so referencing these imports will raise a `TypeError`.

 */

/**
 * Builds the Magic `<WebView>` overlay styles. These base styles enable
 * `<WebView>` UI to render above all other DOM content.
 */
function createWebViewStyles() {
  return webSafeImports.rn.StyleSheet.create({
    'magic-webview': {
      flex: 1,
      backgroundColor: 'transparent',
    },

    'webview-container': {
      flex: 1,
      width: '100%',
      backgroundColor: 'transparent',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    show: {
      zIndex: 10000,
    },

    hide: {
      zIndex: -10000,
    },
  });
}

/**
 * Overloads React Native's `<View>` with helper methods we require to hide/show
 * the rendered `<WebView>`.
 */
interface ViewWrapper {
  showOverlay: () => void;
  hideOverlay: () => void;
}

/**
 * View controller for the Magic `<WebView>` overlay.
 */
export class ReactNativeWebViewController {
  public webView: any;
  private container: ViewWrapper | null;
  public ready: Promise<void>;
  private styles: any;

  constructor(
    private readonly transport: PayloadTransport,
    private readonly endpoint: string,
    private readonly encodedQueryParams: string,
  ) {
    this.webView = null;
    this.container = null;
    this.ready = this.waitForReady();
    this.styles = createWebViewStyles();
    this.listen();
  }

  /**
   * Renders a React Native `<WebView>` with built-in message handling to and
   * from the Magic `<iframe>` context.
   */
  // Validating this logic requires lots of React-specific boilerplate. We will
  // revisit this method for unit testing in the future. For now, manual testing
  // is sufficient (this logic is stable right now and not expected to change in
  // the forseeable future).
  /* istanbul ignore next */
  public Relayer: React.FC = () => {
    const [show, setShow] = useState(false);

    /**
     * Saves a reference to the underlying `<WebView>` node so we can interact
     * with incoming messages.
     */
    const webViewRef = useCallback((webView: any): void => {
      this.webView = webView;
    }, []);

    /**
     * Saves a reference to the underlying `<View>` node so we can interact with
     * display styles.
     */
    const containerRef = useCallback((view: any): void => {
      this.container = {
        ...view,
        showOverlay,
        hideOverlay,
      };
    }, []);

    /**
     * Show the Magic `<WebView>` overlay.
     */
    const showOverlay = useCallback(() => {
      setShow(true);
    }, []);

    /**
     * Hide the Magic `<WebView>` overlay.
     */
    const hideOverlay = useCallback(() => {
      setShow(false);
    }, []);

    const containerStyles = useMemo(() => {
      return [this.styles['webview-container'], show ? this.styles.show : this.styles.hide];
    }, [show]);

    const handleWebViewMessage = useCallback((event: any) => {
      this.transport.handleReactNativeWebViewMessage(event);
    }, []);

    return (
      <webSafeImports.rn.View ref={containerRef} style={containerStyles}>
        <webSafeImports.rnwv.WebView
          ref={webViewRef}
          source={{ uri: `${this.endpoint}/send/?params=${encodeURIComponent(this.encodedQueryParams)}` }}
          onMessage={handleWebViewMessage}
          style={this.styles['magic-webview']}
        />
      </webSafeImports.rn.View>
    );
  };

  /**
   * Set the controller as "ready" for JSON RPC events.
   */
  private waitForReady() {
    return new Promise<void>(resolve => {
      this.transport.on(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY, () => resolve());
    });
  }

  /**
   * Listen for messages sent from the underlying Magic `<WebView>`.
   */
  private listen() {
    this.transport.on(MagicIncomingWindowMessage.MAGIC_HIDE_OVERLAY, () => {
      if (this.container) this.container.hideOverlay();
    });

    this.transport.on(MagicIncomingWindowMessage.MAGIC_SHOW_OVERLAY, () => {
      if (this.container) this.container.showOverlay();
    });
  }
}
