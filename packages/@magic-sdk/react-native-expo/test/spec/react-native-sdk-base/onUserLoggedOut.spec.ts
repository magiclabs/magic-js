import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv.restore();
  reactNativeStyleSheetStub();
});

test('onUserLoggedOut adds callback', () => {
  const magic = createMagicSDK();
  const callbackMock = jest.fn();
  magic.onUserLoggedOut(callbackMock);
  const callbacks = magic.userLoggedOutCallbacks;
  expect(callbacks).toHaveLength(1);
  expect(callbacks[0]).toBe(callbackMock);
});
