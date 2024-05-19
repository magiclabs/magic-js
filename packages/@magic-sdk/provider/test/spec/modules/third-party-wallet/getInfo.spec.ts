import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
  jest.useFakeTimers();
  mockLocalStorage();
});

describe('third party wallet getInfo', () => {
  it('should call web3modalGetInfo if provider is web3modal', () => {
    localStorage.setItem('3pw_provider', 'web3modal');
    const payload = { method: 'getInfo' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallet, 'web3modalGetInfo').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallet.getInfo(payload);
    expect(spy).toHaveBeenCalled();
  });

  it('should call super.request if provider is not set', () => {
    const payload = { method: 'getInfo' };
    const magic = createMagicSDK();
    const requestMock = jest.fn();
    // @ts-expect-error 'request' is protected
    BaseModule.prototype.request = requestMock;
    magic.thirdPartyWallet.getInfo(payload);
    expect(requestMock).toHaveBeenCalled();
  });
});
