import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers();
  mockLocalStorage();
});

describe('third party wallet isLoggedIn', () => {
  it('should call requestOverlay if provider is magic-widget', () => {
    localStorage.setItem('magic_3pw_provider', 'magic-widget');
    const payload = { method: 'isLoggedIn' };
    const magic = createMagicSDK();
    // @ts-expect-error 'requestOverlay' is protected
    const spy = jest.spyOn(BaseModule.prototype, 'requestOverlay').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.isLoggedIn(payload);
    expect(spy).toHaveBeenCalled();
  });

  it('should call super.request if provider is not set', () => {
    const payload = { method: 'isLoggedIn' };
    const magic = createMagicSDK();
    const requestMock = jest.fn();
    // @ts-expect-error 'request' is protected
    BaseModule.prototype.request = requestMock;
    magic.thirdPartyWallets.isLoggedIn(payload);
    expect(requestMock).toHaveBeenCalled();
  });
});
