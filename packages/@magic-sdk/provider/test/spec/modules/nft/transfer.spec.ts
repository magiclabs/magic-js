import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('transfer method should return a PromiEvent', () => {
  const magic = createMagicSDK();

  magic.nft.request = jest.fn().mockReturnValue({
    status: 'complete',
  });

  magic.nft.transfer({
    contractAddress: '0x375625833431b22623ce222e55b1cd15a459ba49',
    tokenId: '1',
    quantity: 1,
    recipient: '0x5a7b63a3a2af31a2d4a020645e11ea99012ef7bf',
  });

  const requestPayload = magic.nft.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_nft_transfer');
  expect(requestPayload.params).toMatchObject([
    {
      contractAddress: '0x375625833431b22623ce222e55b1cd15a459ba49',
      tokenId: '1',
      quantity: 1,
      recipient: '0x5a7b63a3a2af31a2d4a020645e11ea99012ef7bf',
    },
  ]);
});
