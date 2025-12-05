import { setRefreshTokenInSecureStore } from '../../../src/native-crypto/keychain';
import { createReactNativeWebViewController } from '../../factories';

jest.mock('../../../src/native-crypto/keychain', () => ({
  setRefreshTokenInSecureStore: jest.fn(),
}));

describe('persistMagicEventRefreshToken', () => {
  it('should not call setRefreshTokenInSecureStore if no data.rt', async () => {
    const viewController = createReactNativeWebViewController('asdf');
    const result = await viewController.persistMagicEventRefreshToken({});

    expect(result).toBeUndefined();
    expect(setRefreshTokenInSecureStore).not.toHaveBeenCalled();
  });

  it('should call setRefreshTokenInSecureStore', async () => {
    const viewController = createReactNativeWebViewController('asdf');
    await viewController.persistMagicEventRefreshToken({
      data: {
        rt: 'test-token',
      },
    });

    expect(setRefreshTokenInSecureStore).toHaveBeenCalledWith('test-token');
  });
});
