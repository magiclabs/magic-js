import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers();
  mockLocalStorage();
});

describe('third party wallet getInfo', () => {
  it('should call web3modalGetInfo if provider is web3modal', () => {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const payload = { method: 'getInfo' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallets, 'web3modalGetInfo').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.getInfo(payload);
    expect(spy).toHaveBeenCalled();
  });

  it('should format metadata from an external provider', async () => {
    localStorage.setItem('magic_3pw_provider', 'metamask');
    localStorage.setItem('magic_3pw_address', '0x1234567890');
    const payload = { method: 'getInfo' };
    const magic = createMagicSDK();
    magic.thirdPartyWallets.setExternalProvider({ request: jest.fn() });
    const result = await magic.thirdPartyWallets.getInfo(payload as any);
    expect(result).toEqual({
      publicAddress: '0x1234567890',
      email: null,
      issuer: 'did:ethr:0x1234567890',
      phoneNumber: null,
      isMfaEnabled: false,
      recoveryFactors: [],
      walletType: 'metamask',
      firstLoginAt: null,
    });
  });

  it('should call super.request if provider is not set', () => {
    const payload = { method: 'getInfo' };
    const magic = createMagicSDK();
    const requestMock = jest.fn();
    // @ts-expect-error 'request' is protected
    BaseModule.prototype.request = requestMock;
    magic.thirdPartyWallets.getInfo(payload);
    expect(requestMock).toHaveBeenCalled();
  });
});

describe('format web3modal getinfo response', () => {
  it('should format the response correctly', () => {
    const magic = createMagicSDK();

    magic.web3modal = {
      modal: {
        getWalletInfo: jest.fn().mockReturnValue({
          name: 'Magic',
        }),
        getAddress: jest.fn().mockReturnValue('0x1234567890'),
      },
    };

    const response = magic.thirdPartyWallets.formatWeb3modalGetInfoResponse();

    expect(response).toEqual({
      publicAddress: '0x1234567890',
      email: null,
      firstLoginAt: null,
      issuer: 'did:ethr:0x1234567890',
      phoneNumber: null,
      isMfaEnabled: false,
      recoveryFactors: [],
      walletType: 'Magic',
    });
  });
});
