import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ViewController, createModalNotReadyError } from '@magic-sdk/provider';
import { MagicMessageEvent } from '@magic-sdk/types';
import { isTypedArray } from 'lodash';
import Global = NodeJS.Global;

const MAGIC_PAYLOAD_FLAG_TYPED_ARRAY = 'MAGIC_PAYLOAD_FLAG_TYPED_ARRAY';

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
export class ReactNativeWebViewController extends ViewController {
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
      this.handleReactNativeWebViewMessage(event);
    }, []);

    return (
      <View ref={containerRef} style={containerStyles}>
        <WebView
          ref={webViewRef}
          source={{ uri: `${this.endpoint}/send/?params=${encodeURIComponent(this.parameters)}` }}
          onMessage={handleWebViewMessage}
          style={this.styles['magic-webview']}
        />
      </View>
    );
  };

  /**
   * Route incoming messages from a React Native `<WebView>`.
   */
  private handleReactNativeWebViewMessage(event: any) {
    if (
      event.nativeEvent &&
      typeof event.nativeEvent.data === 'string' &&
      /* Backward comaptible */
      (event.nativeEvent.url === `${this.endpoint}/send/?params=${encodeURIComponent(this.parameters)}` ||
        event.nativeEvent.url === `${this.endpoint}/send/?params=${this.parameters}`)
    ) {
      // Special parsing logic when dealing with TypedArray in the payload
      // Such change is required as JSON.stringify will manipulate the object and cause exceptions during parsing
      // The typed Array is stringified in Mgbox with a flag as notation.
      const data: any = JSON.parse(event.nativeEvent.data, (key, value) => {
        try {
          if (value && typeof value === 'object' && value.flag && value.flag === 'MAGIC_PAYLOAD_FLAG_TYPED_ARRAY') {
            return global[value.constructor as keyof Global](value.data.split(','));
          }

          // silently handles exception and return the original copy
          // eslint-disable-next-line no-empty
        } catch (e) {}
        return value;
      });

      if (data && data.msgType && this.messageHandlers.size) {
        // If the response object is undefined, we ensure it's at least an
        // empty object before passing to the event listener.
        /* eslint-disable-next-line no-param-reassign */
        data.response = data.response ?? {};

        // Reconstruct event from RN event
        const magicEvent: MagicMessageEvent = { data } as MagicMessageEvent;
        for (const handler of this.messageHandlers.values()) {
          handler(magicEvent);
        }
      }
    }
  }

  protected hideOverlay() {
    if (this.container) this.container.hideOverlay();
  }

  protected showOverlay() {
    if (this.container) this.container.showOverlay();
  }

  protected async _post(data: any) {
    if (this.webView && (this.webView as any).postMessage) {
      (this.webView as any).postMessage(
        JSON.stringify(data, (key, value) => {
          // parse Typed Array to Stringify object
          if (isTypedArray(value)) {
            return {
              constructor: value.constructor.name,
              data: value.toString(),
              flag: MAGIC_PAYLOAD_FLAG_TYPED_ARRAY,
            };
          }
          return value;
        }),
        this.endpoint,
      );
    } else {
      throw createModalNotReadyError();
    }
  }
}
