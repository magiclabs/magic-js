import { createMagicSDK } from '../../../factories';
import { mockLocalStorage } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  jest.restoreAllMocks();
  mockLocalStorage();
});

describe('third party wallet magicWidgetLogout', () => {
  it('should resolve with the result of the overlay logout request', async () => {
    const payload = { method: 'magic_auth_logout' };
    const magic = createMagicSDK();
    const clearConnectedState = jest.fn();
    (magic as any).walletKit = { clearConnectedState };
    // @ts-expect-error 'requestOverlay' is protected
    jest.spyOn(BaseModule.prototype, 'requestOverlay').mockImplementation(() => Promise.resolve(true));

    const result = await magic.thirdPartyWallets.magicWidgetLogout(payload);

    expect(clearConnectedState).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should reject if the overlay logout request fails', async () => {
    const payload = { method: 'magic_auth_logout' };
    const magic = createMagicSDK();
    (magic as any).walletKit = { clearConnectedState: jest.fn() };
    const error = new Error('logout failed');
    // @ts-expect-error 'requestOverlay' is protected
    jest.spyOn(BaseModule.prototype, 'requestOverlay').mockImplementation(() => Promise.reject(error));

    await expect(magic.thirdPartyWallets.magicWidgetLogout(payload)).rejects.toBe(error);
  });

  it('should still request the overlay logout if clearing wallet kit state throws', async () => {
    const payload = { method: 'magic_auth_logout' };
    const magic = createMagicSDK();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error 'requestOverlay' is protected
    jest.spyOn(BaseModule.prototype, 'requestOverlay').mockImplementation(() => Promise.resolve(true));

    const result = await magic.thirdPartyWallets.magicWidgetLogout(payload);

    expect(console.error).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
