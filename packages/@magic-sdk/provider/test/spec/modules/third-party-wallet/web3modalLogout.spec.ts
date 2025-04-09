import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();
  mockLocalStorage();
});

describe('third party wallet web3modalLogout', () => {
  it('should call getIsConnected', () => {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const payload = { method: 'logout' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallets, 'web3modalLogout').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.web3modalLogout(payload);
    expect(spy).toHaveBeenCalledWith(payload);
  });
});
