import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  jest.useFakeTimers();
  mockLocalStorage();
});

describe('third party wallet logout', () => {
  it('should call web3modal.logout if provider is web3modal', () => {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const payload = { method: 'logout' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallets, 'web3modalLogout').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.logout(payload);
    expect(spy).toHaveBeenCalled();
  });

  it('should call the external disconnect handler', async () => {
    localStorage.setItem('magic_3pw_provider', 'metamask');
    const payload = { method: 'logout' };
    const magic = createMagicSDK();
    const disconnectMock = jest.fn().mockResolvedValue(undefined);
    magic.thirdPartyWallets.setExternalProvider({ request: jest.fn() }, { disconnect: disconnectMock });
    await magic.thirdPartyWallets.logout(payload as any);
    expect(disconnectMock).toHaveBeenCalled();
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
