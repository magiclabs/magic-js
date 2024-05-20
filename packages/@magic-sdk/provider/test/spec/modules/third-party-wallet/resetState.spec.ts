import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();
  mockLocalStorage();
});

describe('third party wallet resetState', () => {
  it('should clear relevant localStorage items and set isConnected to false', () => {
    const magic = createMagicSDK();
    localStorage.setItem('magic_3pw_provider', 'some_provider');
    localStorage.setItem('magic_3pw_address', 'some_address');
    localStorage.setItem('magic_3pw_chainId', 'some_chainId');
    magic.thirdPartyWallet.isConnected = true;

    magic.thirdPartyWallet.resetState();

    expect(localStorage.getItem('magic_3pw_provider')).toBeUndefined();
    expect(localStorage.getItem('magic_3pw_address')).toBeUndefined();
    expect(localStorage.getItem('magic_3pw_chainId')).toBeUndefined();
    expect(magic.thirdPartyWallet.isConnected).toBe(false);
  });
});
