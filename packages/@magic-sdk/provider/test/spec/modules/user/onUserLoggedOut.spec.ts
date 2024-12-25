import { createMagicSDK } from '../../../factories';

test('onUserLoggedOut adds callback', () => {
  const magic = createMagicSDK();
  const callbackMock = jest.fn();
  magic.user.onUserLoggedOut(callbackMock);
  const callbacks = magic.user.userLoggedOutCallbacks;
  expect(callbacks).toHaveLength(1);
  expect(callbacks[0]).toBe(callbackMock);
});
