import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ViewController, createModalNotReadyError } from '@magic-sdk/provider';
import { ReactNativeTransport } from './react-native-transport';

/**
 * Builds the Magic `<WebView>` overlay styles. These base styles enable
 * `<WebView>` UI to render above all other DOM content.
 */
function createWebViewStyles() {
  return StyleSheet.create({
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
      elevation: 10000,
    },

    hide: {
      zIndex: -10000,
      elevation: 0,
    },
  });
}

/**
 * Overloads React Native's `<View>` with helper methods we require to hide/show
 * the rendered `<WebView>`.
 */
interface ViewWrapper extends View {
  showOverlay: () => void;
  hideOverlay: () => void;
}

/**
 * View controller for the Magic `<WebView>` overlay.
 */
export class ReactNativeWebViewController extends ViewController<ReactNativeTransport> {
  private webView!: WebView | null;
  private container!: ViewWrapper | null;
  private styles: any;

  protected init() {
    this.webView = null;
    this.container = null;
    this.styles = createWebViewStyles();
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
      <View ref={containerRef} style={containerStyles}>
        <WebView
          ref={webViewRef}
          source={{ uri: `${this.endpoint}/send/?params=${this.parameters}` }}
          onMessage={handleWebViewMessage}
          style={this.styles['magic-webview']}
        />
      </View>
    );
  };

  protected hideOverlay() {
    if (this.container) this.container.hideOverlay();
  }

  protected showOverlay() {
    if (this.container) this.container.showOverlay();
  }

  public async postMessage(data: any) {
    if (this.webView && (this.webView as any).postMessage) {
      (this.webView as any).postMessage(JSON.stringify(data), this.endpoint);
    } else {
      throw createModalNotReadyError();
    }
  }
}
