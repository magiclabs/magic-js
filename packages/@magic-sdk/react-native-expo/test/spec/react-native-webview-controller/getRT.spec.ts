import { getRefreshTokenInSecureStore } from '../../../src/native-crypto/keychain';
import { createReactNativeWebViewController } from '../../factories';

jest.mock('../../../src/native-crypto/keychain', () => ({
  getRefreshTokenInSecureStore: jest.fn(),
}));

describe('getRT', () => {
  it('should call getRefreshTokenInSecureStore', async () => {
    const viewController = createReactNativeWebViewController('asdf');
    await viewController.getRT();

    expect(getRefreshTokenInSecureStore).toHaveBeenCalled();
  });
});
