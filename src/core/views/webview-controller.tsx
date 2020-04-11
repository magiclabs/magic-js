import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { MagicIncomingWindowMessage } from '../../types';
import { PayloadTransport } from '../payload-transport';

/**
 * Fortmatic `<iframe>` overlay styles. These base styles enable `<iframe>` UI
 * to render above all other DOM content.
 */
const styles = StyleSheet.create({
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

/**
 * View controller for the Fortmatic `<iframe>` overlay.
 */
export class WebViewController {
  public webView: WebView | null;
  private container: ViewWrapper | null;
  public ready: Promise<void>;

  constructor(
    private readonly transport: PayloadTransport,
    private readonly endpoint: string,
    private readonly encodedQueryParams: string,
  ) {
    this.webView = null;
    this.container = null;
    this.ready = this.waitForReady();
    this.listen();
  }

  public init: React.FC = () => {
    const [show, setShow] = useState(false);

    const webViewRef = useCallback((webView: WebView): void => {
      this.webView = webView;
    }, []);

    const containerRef = useCallback((view: View): void => {
      this.container = {
        ...view,
        showOverlay,
        hideOverlay,
      };
    }, []);

    const showOverlay = useCallback(() => {
      setShow(true);
    }, []);

    const hideOverlay = useCallback(() => {
      setShow(false);
    }, []);

    const viewStyles = useMemo(() => {
      return [styles['webview-container'], show ? styles.show : styles.hide];
    }, [show]);

    const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
      this.transport.handleWebViewMessage(event);
    }, []);

    return (
      <View ref={containerRef} style={viewStyles}>
        <WebView
          ref={webViewRef}
          source={{ uri: `${this.endpoint}/send/?params=${this.encodedQueryParams}` }}
          onMessage={handleWebViewMessage}
          style={styles['magic-webview']}
        />
      </View>
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
   * Listen for messages sent from the underlying Fortmatic `<iframe>`.
   */
  private listen() {
    this.transport.on(MagicIncomingWindowMessage.MAGIC_HIDE_OVERLAY, () => {
      return this.container?.hideOverlay();
    });

    this.transport.on(MagicIncomingWindowMessage.MAGIC_SHOW_OVERLAY, () => {
      return this.container?.showOverlay();
    });
  }
}

export interface ViewWrapper extends Partial<View> {
  showOverlay: () => void | undefined;
  hideOverlay: () => void | undefined;
}
