import { getDpop } from '../../../src/native-crypto/dpop';
import { createReactNativeWebViewController } from '../../factories';

jest.mock('../../../src/native-crypto/dpop', () => ({
  getDpop: jest.fn(),
}));

describe('getJWT', () => {
  it('should call getDpop', async () => {
    const viewController = createReactNativeWebViewController('asdf');
    await viewController.getJWT();

    expect(getDpop).toHaveBeenCalled();
  });

  it('should return null if getDpop throws an error', async () => {
    const viewController = createReactNativeWebViewController('asdf');
    (getDpop as jest.Mock).mockRejectedValueOnce(new Error('test-error'));
    const result = await viewController.getJWT();
    expect(result).toBeNull();
  });
});
