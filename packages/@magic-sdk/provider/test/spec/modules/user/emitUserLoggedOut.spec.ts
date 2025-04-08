import browserEnv from '../../../../../../../scripts/utils/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('emitUserLoggedOut emits event', () => {
  const magic = createMagicSDK();
  const callbackMock = jest.fn();
  magic.user.onUserLoggedOut(callbackMock);
  magic.user.emitUserLoggedOut(true);
  expect(callbackMock).toHaveBeenCalledWith(true);
});
