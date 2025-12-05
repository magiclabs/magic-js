import { getRefreshTokenInKeychain } from '../../../src/native-crypto/keychain';
import { createReactNativeWebViewController } from '../../factories';

jest.mock('../../../src/native-crypto/keychain', () => ({
  getRefreshTokenInKeychain: jest.fn(),
}));

describe('getRT', () => {
  it('should call getRefreshTokenInKeychain', async () => {
    const viewController = createReactNativeWebViewController('asdf');
    await viewController.getRT();

    expect(getRefreshTokenInKeychain).toHaveBeenCalled();
  });
});
