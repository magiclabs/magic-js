import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();
  mockLocalStorage();
});

describe('third party wallet web3modalIsLoggedIn', () => {
  it('should call getIsConnected', () => {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallet, 'web3modalIsLoggedIn').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallet.isLoggedIn();
    expect(spy).toHaveBeenCalled();
  });
});
