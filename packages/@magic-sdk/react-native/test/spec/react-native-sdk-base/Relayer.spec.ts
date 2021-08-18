import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv.restore();
  reactNativeStyleSheetStub();
});

test('SDKBaseReactNative.Relayer aliases to ReactNativeWebViewController.Relayer', () => {
  const magic = createMagicSDK();

  (magic as any).overlay.Relayer = 'hello world';
  expect(magic.Relayer).toBe('hello world' as any);
});
