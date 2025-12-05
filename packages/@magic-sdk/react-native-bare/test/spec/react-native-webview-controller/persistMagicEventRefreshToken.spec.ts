import { setRefreshTokenInKeychain } from '../../../src/native-crypto/keychain';
import { createReactNativeWebViewController } from '../../factories';

jest.mock('../../../src/native-crypto/keychain', () => ({
  setRefreshTokenInKeychain: jest.fn(),
}));

describe('persistMagicEventRefreshToken', () => {
  it('should not call setRefreshTokenInKeychain if no data.rt', async () => {
    const viewController = createReactNativeWebViewController('asdf');
    const result = await viewController.persistMagicEventRefreshToken({});

    expect(result).toBeUndefined();
    expect(setRefreshTokenInKeychain).not.toHaveBeenCalled();
  });

  it('should call setRefreshTokenInKeychain', async () => {
    const viewController = createReactNativeWebViewController('asdf');
    await viewController.persistMagicEventRefreshToken({
      data: {
        rt: 'test-token',
      },
    });

    expect(setRefreshTokenInKeychain).toHaveBeenCalledWith('test-token');
  });
});
