import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { createMagicSDK } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

test.beforeEach(() => {
  browserEnv();
  reactNativeStyleSheetStub();
});

test('SDKBaseReactNative.Relayer aliases to ReactNativeWebViewController.Relayer', t => {
  const magic = createMagicSDK();

  (magic as any).overlay.Relayer = 'hello world';
  t.is(magic.Relayer, 'hello world' as any);
});
