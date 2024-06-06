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
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    const payload = { method: 'getInfo' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallets, 'web3modalGetInfo').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.getInfo(payload);
    expect(spy).toHaveBeenCalled();
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

    console.log(magic.web3modal.modal.getWalletInfo());
    console.log(magic.web3modal.modal.getAddress());

    const response = magic.thirdPartyWallets.formatWeb3modalGetInfoResponse();

    expect(response).toEqual({
      publicAddress: '0x1234567890',
      email: null,
      issuer: '$did:ethr:0x1234567890',
      phoneNumber: null,
      isMfaEnabled: false,
      recoveryFactors: [],
      walletType: 'Magic',
    });
  });
});
