import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
  jest.useFakeTimers();
  mockLocalStorage();
});

describe('third party wallet logout', () => {
  it('should call web3modal.logout if provider is web3modal', () => {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const payload = { method: 'logout' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallet, 'web3modalLogout').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.logout(payload);
    expect(spy).toHaveBeenCalled();
  });

  it('should call super.request if provider is not set', () => {
    const payload = { method: 'logout' };
    const magic = createMagicSDK();
    const requestMock = jest.fn();
    // @ts-expect-error 'request' is protected
    BaseModule.prototype.request = requestMock;
    magic.thirdPartyWallets.logout(payload);
    expect(requestMock).toHaveBeenCalled();
  });
});
