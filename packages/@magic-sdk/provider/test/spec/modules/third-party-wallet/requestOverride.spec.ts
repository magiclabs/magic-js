import { MagicPayloadMethod } from '@magic-sdk/types';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';
import { mockLocalStorage } from '../../../mocks';

beforeEach(() => {
  jest.resetAllMocks();
  mockLocalStorage();
  // @ts-expect-error 'request' is protected
  BaseModule.prototype.request = jest.fn();
});

describe('third party wallet requestOverride', () => {
  it('should call resetState and super.request for MagicPayloadMethod.Login', () => {
    const payload = { method: MagicPayloadMethod.Login };
    const magic = createMagicSDK();
    const resetStateMock = jest.fn();
    magic.thirdPartyWallets.resetThirdPartyWalletState = resetStateMock;
    magic.thirdPartyWallets.requestOverride(payload);
    expect(resetStateMock).toBeCalled();
    // @ts-expect-error 'request' is protected
    expect(BaseModule.prototype.request.mock.calls[0][0]).toEqual(payload);
  });

  it('should call super.request for MagicPayloadMethod.GetInfo', () => {
    const payload = { method: MagicPayloadMethod.GetInfo };
    const magic = createMagicSDK();
    const getInfoMock = jest.fn();
    magic.thirdPartyWallets.getInfo = getInfoMock;
    magic.thirdPartyWallets.requestOverride(payload);
    expect(getInfoMock).toBeCalled();
  });

  it('should call super.request for MagicPayloadMethod.IsLoggedIn', () => {
    const payload = { method: MagicPayloadMethod.IsLoggedIn };
    const magic = createMagicSDK();
    const isLoggedInMock = jest.fn();
    magic.thirdPartyWallets.isLoggedIn = isLoggedInMock;
    magic.thirdPartyWallets.requestOverride(payload);
    expect(isLoggedInMock).toBeCalled();
  });

  it('should call super.request for MagicPayloadMethod.Logout', () => {
    const payload = { method: MagicPayloadMethod.Logout };
    const magic = createMagicSDK();
    const logoutMock = jest.fn();
    magic.thirdPartyWallets.logout = logoutMock;
    magic.thirdPartyWallets.requestOverride(payload);
    expect(logoutMock).toBeCalled();
  });

  it('should call web3modalRequest if provider is web3modal', () => {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const payload = { method: 'someMethod' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallets, 'web3modalRequest').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.requestOverride(payload);
    expect(spy).toBeCalled();
  });

  it('should delegate to external provider when provider is metamask', async () => {
    localStorage.setItem('magic_3pw_provider', 'metamask');
    const payload = { method: 'eth_requestAccounts', params: [] };
    const magic = createMagicSDK();
    const requestMock = jest.fn().mockResolvedValue(['0xabc']);
    magic.thirdPartyWallets.setExternalProvider({ request: requestMock });
    const result = await magic.thirdPartyWallets.requestOverride(payload as any);
    expect(requestMock).toHaveBeenCalledWith({ method: 'eth_requestAccounts', params: [] });
    expect(result).toEqual(['0xabc']);
  });

  it('should call super.request if provider is not set', () => {
    const payload = { method: 'someMethod' };
    const magic = createMagicSDK();
    magic.thirdPartyWallets.requestOverride(payload);
    // @ts-expect-error 'request' is protected
    expect(BaseModule.prototype.request.mock.calls[0][0]).toEqual(payload);
  });
});
