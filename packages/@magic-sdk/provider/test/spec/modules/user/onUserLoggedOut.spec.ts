import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('onUserLoggedOut adds callback', () => {
  const magic = createMagicSDK();
  const callbackMock = jest.fn();
  magic.user.onUserLoggedOut(callbackMock);
  const callbacks = magic.user.userLoggedOutCallbacks;
  expect(callbacks).toHaveLength(1);
  expect(callbacks[0]).toBe(callbackMock);
});
