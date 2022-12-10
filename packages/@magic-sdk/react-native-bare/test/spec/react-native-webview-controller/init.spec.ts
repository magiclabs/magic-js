import browserEnv from '@ikscodes/browser-env';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv();
});

test("Intializes 'webView' with null", () => {
  const overlay = createReactNativeWebViewController();
  expect(overlay.webView).toEqual(null);
});

test("Intializes 'container' with null", () => {
  const overlay = createReactNativeWebViewController();
  expect(overlay.container).toEqual(null);
});

test("Intializes 'styles' with the result of React Native's StyleSheet.create", () => {
  const stylesheetCreateStub = reactNativeStyleSheetStub();

  createReactNativeWebViewController();

  expect(stylesheetCreateStub.mock.calls[0]).toEqual([
    {
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
    },
  ]);
});
