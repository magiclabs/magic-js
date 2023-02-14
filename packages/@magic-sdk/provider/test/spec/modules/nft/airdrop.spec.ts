import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_nft_airdrop`', async () => {
  const magic = createMagicSDK();
  magic.nft.request = jest.fn();

  magic.nft.airdrop();

  const requestPayload = magic.nft.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_nft_airdrop');
  expect(requestPayload.params).toEqual([]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.nft.airdrop())).toBeTruthy();
});
