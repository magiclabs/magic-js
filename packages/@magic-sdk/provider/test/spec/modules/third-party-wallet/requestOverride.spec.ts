import browserEnv from '@ikscodes/browser-env';
import { MagicPayloadMethod } from '@magic-sdk/types';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';
import { mockLocalStorage } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();
  mockLocalStorage();
  (BaseModule as any).prototype.request = jest.fn();
});

describe('third party wallet requestOverride', () => {
  it('should call resetState and super.request for MagicPayloadMethod.Login', () => {
    const payload = { method: MagicPayloadMethod.Login };
    const magic = createMagicSDK();
    const resetStateMock = jest.fn();
    magic.thirdPartyWallet.resetState = resetStateMock;
    magic.thirdPartyWallet.requestOverride(payload);
    expect(resetStateMock).toBeCalled();
    expect((BaseModule as any).prototype.request.mock.calls[0][0]).toEqual(payload);
  });

  it('should call super.request for MagicPayloadMethod.GetInfo', () => {
    const payload = { method: MagicPayloadMethod.GetInfo };
    const magic = createMagicSDK();
    const getInfoMock = jest.fn();
    magic.thirdPartyWallet.getInfo = getInfoMock;
    magic.thirdPartyWallet.requestOverride(payload);
    expect(getInfoMock).toBeCalled();
  });

  it('should call super.request for MagicPayloadMethod.IsLoggedIn', () => {
    const payload = { method: MagicPayloadMethod.IsLoggedIn };
    const magic = createMagicSDK();
    const isLoggedInMock = jest.fn();
    magic.thirdPartyWallet.isLoggedIn = isLoggedInMock;
    magic.thirdPartyWallet.requestOverride(payload);
    expect(isLoggedInMock).toBeCalled();
  });

  it('should call super.request for MagicPayloadMethod.Logout', () => {
    const payload = { method: MagicPayloadMethod.Logout };
    const magic = createMagicSDK();
    const logoutMock = jest.fn();
    magic.thirdPartyWallet.logout = logoutMock;
    magic.thirdPartyWallet.requestOverride(payload);
    expect(logoutMock).toBeCalled();
  });

  it('should call web3modalRequest if provider is web3modal', async () => {
    localStorage.setItem('3pw_provider', 'web3modal');
    const payload = { method: 'someMethod' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallet, 'web3modalRequest').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallet.requestOverride(payload);
    expect(spy).toBeCalled();
  });

  it('should call super.request if provider is not set', async () => {
    const payload = { method: 'someMethod' };
    const magic = createMagicSDK();
    magic.thirdPartyWallet.requestOverride(payload);
    expect((BaseModule as any).prototype.request.mock.calls[0][0]).toEqual(payload);
  });
});
