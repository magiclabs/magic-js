import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('checkout method should return a PromiEvent', () => {
  const magic = createMagicSDK();

  magic.nft.request = jest.fn().mockReturnValue({
    status: 'complete',
    viewInWallet: true,
  });

  magic.nft.checkout({
    contractId: '1cd4cfe8-b997-466e-8b0d-ff1177222ba4',
    contractAddress: '0x375625833431b22623ce222e55b1cd15a459ba49',
    tokenId: '1',
    name: 'NFT Checkout Test',
    imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/382ceb42f28fb4df0d12897d5d433084',
    quantity: 1,
  });

  const requestPayload = magic.nft.request.mock.calls[0][0];
  console.log(requestPayload.params);
  expect(requestPayload.method).toBe('magic_nft_checkout');
  expect(requestPayload.params).toMatchObject([
    {
      contractId: '1cd4cfe8-b997-466e-8b0d-ff1177222ba4',
      contractAddress: '0x375625833431b22623ce222e55b1cd15a459ba49',
      tokenId: '1',
      name: 'NFT Checkout Test',
      imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/382ceb42f28fb4df0d12897d5d433084',
      quantity: 1,
    },
  ]);
});
