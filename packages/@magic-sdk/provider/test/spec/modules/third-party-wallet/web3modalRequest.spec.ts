import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';

beforeEach(() => {
  jest.resetAllMocks();
  mockLocalStorage();
});

describe('third party wallet web3modalRequest', () => {
  it('should call getIsConnected', () => {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const payload = { method: 'request' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallets, 'web3modalRequest').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.web3modalRequest(payload);
    expect(spy).toHaveBeenCalledWith(payload);
  });
});
