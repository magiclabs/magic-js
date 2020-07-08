import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

test.beforeEach((t) => {
  browserEnv();
  reactNativeStyleSheetStub();
});

test("Intializes 'webView' with null", (t) => {
  const overlay = createReactNativeWebViewController();
  t.is((overlay as any).webView, null);
});

test("Intializes 'container' with null", (t) => {
  const overlay = createReactNativeWebViewController();
  t.is((overlay as any).container, null);
});

test("Intializes 'styles' with the result of React Native's StyleSheet.create", (t) => {
  reactNativeStyleSheetStub().returns('hello world');

  const overlay = createReactNativeWebViewController();
  t.is((overlay as any).styles, 'hello world');
});

test('Stylesheet.create is called with the expected style object', (t) => {
  const stylesheetCreateStub = reactNativeStyleSheetStub();

  createReactNativeWebViewController();

  t.deepEqual(stylesheetCreateStub.args[0], [
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
      },

      hide: {
        zIndex: -10000,
      },
    },
  ]);
});
