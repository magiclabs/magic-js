import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';

beforeEach(() => {
  jest.resetAllMocks();
  mockLocalStorage();
});

describe('third party wallet web3modalGetInfo', () => {
  it('should call getIsConnected', () => {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const payload = { method: 'getInfo' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallets, 'web3modalGetInfo').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.web3modalGetInfo(payload);
    expect(spy).toHaveBeenCalledWith(payload);
  });
});
