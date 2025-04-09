import { createMagicSDK } from '../../../factories';

test('emitUserLoggedOut emits event', () => {
  const magic = createMagicSDK();
  const callbackMock = jest.fn();
  magic.user.onUserLoggedOut(callbackMock);
  magic.user.emitUserLoggedOut(true);
  expect(callbackMock).toHaveBeenCalledWith(true);
});
