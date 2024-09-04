import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ViewController, createModalNotReadyError } from '@magic-sdk/provider';
import { MagicMessageEvent } from '@magic-sdk/types';
import { isTypedArray } from 'lodash';
import Global = NodeJS.Global;
import { useInternetConnection } from './hooks';
import { logError, logInfo } from './datadog';
import AsyncStorage from "@react-native-async-storage/async-storage";

const MAGIC_PAYLOAD_FLAG_TYPED_ARRAY = 'MAGIC_PAYLOAD_FLAG_TYPED_ARRAY';
const OPEN_IN_DEVICE_BROWSER = 'open_in_device_browser';
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';

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
  public Relayer: React.FC<{ backgroundColor?: string }> = (backgroundColor) => {
    const [show, setShow] = useState(false);
    const isConnected = useInternetConnection();

    useEffect(() => {
      this.isConnectedToInternet = isConnected;
      logInfo('isConnectedToInternet changed', { isConnected });
    }, [isConnected]);

    useEffect(() => {
      // reset lastPost when webview is first mounted
      AsyncStorage.setItem('lastPost', '')
      return () => {
        logInfo('Relayer unmounted');
        this.isReadyForRequest = false;
      };
    }, []);

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
      logInfo('showOverlay called');
      setShow(true);
    }, []);

    /**
     * Hide the Magic `<WebView>` overlay.
     */
    const hideOverlay = useCallback(() => {
      logInfo('hideOverlay called');
      setShow(false);
    }, []);

    const containerStyles = useMemo(() => {
      return [
        this.styles['webview-container'],
        show
          ? {
              ...this.styles.show,
              backgroundColor: backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
            }
          : this.styles.hide,
      ];
    }, [show]);

    const handleWebViewMessage = useCallback((event: any) => {
      this.handleReactNativeWebViewMessage(event);
    }, []);

    return (
        <SafeAreaView ref={containerRef} style={containerStyles}>
          <WebView
            onHttpError={(event) => {
              logError('WebView HTTP error', { event });
            }}
            onLoadEnd={() => {
              logInfo('WebView load ended');
            }}
            onLoadProgress={(event) => {
              logInfo('WebView load progress', { event });
            }}
            onLoadStart={() => {
              logInfo('WebView load started');
            }}
            onLayout={() => {
              logInfo('WebView layout changed');
            }}
            onContentProcessDidTerminate={() => {
              logError('WebView content process terminated');
            }}
            onError={(error) => {
              logError('WebView error', { error });
            }}
            ref={webViewRef}
            source={{ uri: `${this.endpoint}/send/?params=${encodeURIComponent(this.parameters)}` }}
            onMessage={handleWebViewMessage}
            style={this.styles['magic-webview']}
            webviewDebuggingEnabled
            autoManageStatusBarEnabled={false}
            onShouldStartLoadWithRequest={(event) => {
              const queryParams = new URLSearchParams(event.url.split('?')[1]);
              const openInDeviceBrowser = queryParams.get(OPEN_IN_DEVICE_BROWSER);

              if (openInDeviceBrowser) {
                Linking.openURL(event.url);
                return false;
              }
              return true;
            }}
            limitsNavigationsToAppBoundDomains
          />
        </SafeAreaView>
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

      logInfo('handleReactNativeWebViewMessage called', JSON.parse(event.nativeEvent.data));

      const data: any = JSON.parse(event.nativeEvent.data, (key, value) => {
        try {
          if (value && typeof value === 'object' && value.flag && value.flag === MAGIC_PAYLOAD_FLAG_TYPED_ARRAY) {
            return new (global[value.constructor as keyof Global] as any)(value.data.split(','));
          }

          // silently handles exception and return the original copy
          // eslint-disable-next-line no-empty
        } catch (e) {
          logError('Error parsing TypedArray', { e });
        }
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

  private async msgPostedAfterInactivity() {
    const lastPostTimestamp: string | null = await AsyncStorage.getItem('lastPost');
    logInfo('lastPostTimestamp: ', lastPostTimestamp)
    if (lastPostTimestamp) {
      const lastPostDate = new Date(lastPostTimestamp).getTime();
      const now = new Date().getTime();
      const fiveMinutes = 5 * 60 * 1000;

      // if last post was more than 5 minutes ago, return true;
      return now - lastPostDate > fiveMinutes;
    }
    return false;
  }

  protected hideOverlay() {
    logInfo('hideOverlay called');
    if (this.container) this.container.hideOverlay();
  }

  protected showOverlay() {
    logInfo('showOverlay called');
    if (this.container) this.container.showOverlay();
  }

  protected async _post(data: any) {
    logInfo('post called', { data });
    console.log('this.isReadyForRequest: ', this.isReadyForRequest)
    if (this.webView && (this.webView as any).postMessage) {
        // if last post was more than 10 minutes ago, reload the webview.
        if (await this.msgPostedAfterInactivity()) {
          this.isReadyForRequest = false;
          this.webView?.reload();
          logInfo('Webview reloaded');

          await AsyncStorage.setItem('lastPost', new Date().toISOString());

          this.post(data.msgType, data.payload);
          return;
        }

      try {
        await AsyncStorage.setItem('lastPost', new Date().toISOString());
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
      } catch (e) {
        logError('post failed', { e });
      }
    } else {
      logError('post failed, modal not ready', data);
      throw createModalNotReadyError();
    }
  }
}
