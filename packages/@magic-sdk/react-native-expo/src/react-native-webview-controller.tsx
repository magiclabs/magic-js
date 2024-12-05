import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ViewController, createModalNotReadyError } from '@magic-sdk/provider';
import { MagicMessageEvent } from '@magic-sdk/types';
import { isTypedArray } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRegister } from 'react-native-event-listeners';
/* global NodeJS */
import Global = NodeJS.Global;
import { useInternetConnection } from './hooks';

const MAGIC_PAYLOAD_FLAG_TYPED_ARRAY = 'MAGIC_PAYLOAD_FLAG_TYPED_ARRAY';
const OPEN_IN_DEVICE_BROWSER = 'open_in_device_browser';
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';
const MSG_POSTED_AFTER_INACTIVITY_EVENT = 'msg_posted_after_inactivity_event';
const LAST_MESSAGE_TIME = 'lastMessageTime';
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
  public Relayer: React.FC<{ backgroundColor?: string }> = backgroundColor => {
    const [show, setShow] = useState(false);
    const [mountOverlay, setMountOverlay] = useState(true);
    const isConnected = useInternetConnection();

    useEffect(() => {
      this.isConnectedToInternet = isConnected;
    }, [isConnected]);

    useEffect(() => {
      // reset lastMessage when webview is first mounted
      AsyncStorage.setItem(LAST_MESSAGE_TIME, '');
      return () => {
        this.isReadyForRequest = false;
      };
    }, []);

    useEffect(() => {
      EventRegister.addEventListener(MSG_POSTED_AFTER_INACTIVITY_EVENT, async message => {
        // If inactivity has been determined, the message is posted only after a brief
        // unmount and re-mount of the webview. This is to ensure the webview is accepting messages.
        // iOS kills webview processes after a certain period of inactivity, like when the app is
        // on background for long periods of time.
        this.isReadyForRequest = false;
        setMountOverlay(false);
        this.post(message.msgType, message.payload);
        await AsyncStorage.setItem(LAST_MESSAGE_TIME, new Date().toISOString());
      });
    }, []);

    useEffect(() => {
      if (!mountOverlay) {
        // Briefly unmount and re-mount the webview to ensure it's ready to accept messages.
        setTimeout(() => setMountOverlay(true), 10);
      }
    }, [mountOverlay]);

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

    if (!mountOverlay) {
      return null;
    }

    return (
      <SafeAreaView ref={containerRef} style={containerStyles}>
        <WebView
          ref={webViewRef}
          source={{ uri: `${this.endpoint}/send/?params=${encodeURIComponent(this.parameters)}` }}
          onMessage={handleWebViewMessage}
          style={this.styles['magic-webview']}
          autoManageStatusBarEnabled={false}
          webviewDebuggingEnabled
          onShouldStartLoadWithRequest={event => {
            const queryParams = new URLSearchParams(event.url.split('?')[1]);
            const openInDeviceBrowser = queryParams.get(OPEN_IN_DEVICE_BROWSER);

            if (openInDeviceBrowser) {
              Linking.openURL(event.url);
              return false;
            }
            return true;
          }}
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
      const data: any = JSON.parse(event.nativeEvent.data, (key, value) => {
        try {
          if (value && typeof value === 'object' && value.flag && value.flag === MAGIC_PAYLOAD_FLAG_TYPED_ARRAY) {
            return new (global[value.constructor as keyof Global] as any)(value.data.split(','));
          }

          // silently handles exception and return the original copy
          // eslint-disable-next-line no-empty
        } catch (e) {}
        return value;
      });

      if (data && data.msgType && this.messageHandlers.size) {
        // If the response object is undefined, we ensure it's at least an
        // empty object before passing to the event listener.

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
    const lastPostTimestamp: string | null = await AsyncStorage.getItem(LAST_MESSAGE_TIME);
    if (lastPostTimestamp) {
      const lastPostDate = new Date(lastPostTimestamp).getTime();
      const now = new Date().getTime();
      const fiveMinutes = 5 * 60 * 1000;

      // there's been inactivity if the new message is posted
      // 5 min or more after the last message.
      return now - lastPostDate > fiveMinutes;
    }
    return false;
  }

  protected hideOverlay() {
    if (this.container) this.container.hideOverlay();
  }

  protected showOverlay() {
    if (this.container) this.container.showOverlay();
  }

  protected async _post(data: any) {
    if (await this.msgPostedAfterInactivity()) {
      EventRegister.emit(MSG_POSTED_AFTER_INACTIVITY_EVENT, data);
      return;
    }
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
      AsyncStorage.setItem(LAST_MESSAGE_TIME, new Date().toISOString());
    } else {
      throw createModalNotReadyError();
    }
  }
}
