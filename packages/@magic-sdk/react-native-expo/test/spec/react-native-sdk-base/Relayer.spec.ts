import { createMagicSDK } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  jest.resetAllMocks();
  reactNativeStyleSheetStub();
});

test('SDKBaseReactNative.Relayer aliases to ReactNativeWebViewController.Relayer', () => {
  const magic = createMagicSDK();

  magic.overlay.Relayer = 'hello world';
  expect(magic.Relayer).toBe('hello world' as any);
});
