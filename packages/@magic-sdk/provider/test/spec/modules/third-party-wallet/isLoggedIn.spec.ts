import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers();
  mockLocalStorage();
});

describe('third party wallet isLoggedIn', () => {
  it('should call web3modalIsLoggedIn if provider is web3modal', () => {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const payload = { method: 'isLoggedIn' };
    const magic = createMagicSDK();
    const spy = jest
      .spyOn(magic.thirdPartyWallets, 'web3modalIsLoggedIn')
      .mockImplementation(() => Promise.resolve({}));
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
