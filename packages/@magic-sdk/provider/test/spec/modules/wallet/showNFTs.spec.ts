import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Generate JSON RPC request payload with method `magic_show_nfts`', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  magic.wallet.showNFTs();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_show_nfts');
  expect(requestPayload.params).toEqual([]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.wallet.showNFTs())).toBeTruthy();
});
