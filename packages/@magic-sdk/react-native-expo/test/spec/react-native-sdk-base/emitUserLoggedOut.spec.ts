import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv.restore();
  reactNativeStyleSheetStub();
});

test('emitUserLoggedOut emits event', () => {
  const magic = createMagicSDK();
  const callbackMock = jest.fn();
  magic.onUserLoggedOut(callbackMock);
  magic.emitUserLoggedOut(true);
  expect(callbackMock).toHaveBeenCalledWith(true);
});
