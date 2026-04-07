import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  jest.useFakeTimers();
  mockLocalStorage();
});

describe('third party wallet logout', () => {
  it('should call magicWidgetLogout if provider is magic-widget', () => {
    localStorage.setItem('magic_3pw_provider', 'magic-widget');
    const payload = { method: 'logout' };
    const magic = createMagicSDK();
    const spy = jest.spyOn(magic.thirdPartyWallets, 'magicWidgetLogout').mockImplementation(() => Promise.resolve({}));
    magic.thirdPartyWallets.logout(payload);
    expect(spy).toHaveBeenCalled();
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
