import browserEnv from '@ikscodes/browser-env';
import { BaseModule } from '../../../../src/modules/base-module';
import { createMagicSDK, createViewController } from '../../../factories';
import { createPromiEvent } from '../../../../src/util';
import { NftCheckoutEventHandler, NftCheckoutEventOnReceived } from '../../../../../types/src/modules/nft-types';

function createBaseModule(postStub: jest.Mock) {
  const sdk = createMagicSDK();
  const viewController = createViewController('');

  viewController.post = postStub;
  Object.defineProperty(sdk, 'overlay', {
    get: () => viewController,
  });

  const baseModule: any = new BaseModule(sdk);

  return { baseModule };
}

beforeEach(() => {
  browserEnv.restore();
});

test('checkout method should return a PromiEvent', async () => {
  const magic = createMagicSDK();

  magic.nft.request = jest.fn().mockReturnValue({
    status: 'processed',
  });

  const response = await magic.nft.checkout({
    contractId: '1cd4cfe8-b997-466e-8b0d-ff1177222ba4',
    contractAddress: '0x375625833431b22623ce222e55b1cd15a459ba49',
    tokenId: '1',
    name: 'NFT Checkout Test',
    imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/382ceb42f28fb4df0d12897d5d433084',
    quantity: 1,
  });

  expect(response.status).toBe('processed');

  const requestPayload = magic.nft.request.mock.calls[0][0];

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

test('checkout method can add isCryptoCheckoutEnabled to request payload', async () => {
  const magic = createMagicSDK();

  magic.nft.request = jest.fn().mockReturnValue({
    status: 'processed',
  });

  const response = await magic.nft.checkout({
    contractId: '1cd4cfe8-b997-466e-8b0d-ff1177222ba4',
    contractAddress: '0x375625833431b22623ce222e55b1cd15a459ba49',
    tokenId: '1',
    name: 'NFT Checkout Test',
    imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/382ceb42f28fb4df0d12897d5d433084',
    quantity: 1,
    isCryptoCheckoutEnabled: true,
  });

  expect(response.status).toBe('processed');

  const requestPayload = magic.nft.request.mock.calls[0][0];

  expect(requestPayload.method).toBe('magic_nft_checkout');
  expect(requestPayload.params).toMatchObject([
    {
      contractId: '1cd4cfe8-b997-466e-8b0d-ff1177222ba4',
      contractAddress: '0x375625833431b22623ce222e55b1cd15a459ba49',
      tokenId: '1',
      name: 'NFT Checkout Test',
      imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/382ceb42f28fb4df0d12897d5d433084',
      quantity: 1,
      isCryptoCheckoutEnabled: true,
    },
  ]);
});

test('Third party wallet is connected', async () => {
  const magic = createMagicSDK();

  magic.thirdPartyWallets.isConnected = true;

  magic.nft.request = jest.fn().mockReturnValue({
    on: jest.fn(),
    status: 'processed',
  });

  const mockPromiEvent = createPromiEvent<string, NftCheckoutEventHandler>((resolve) => {
    resolve('0xasdfsadf');
  });

  const response = await magic.nft.checkout({
    contractId: '1cd4cfe8-b997-466e-8b0d-ff1177222ba4',
    contractAddress: '0x375625833431b22623ce222e55b1cd15a459ba49',
    tokenId: '1',
    name: 'NFT Checkout Test',
    imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/382ceb42f28fb4df0d12897d5d433084',
    quantity: 1,
    isCryptoCheckoutEnabled: true,
  });

  mockPromiEvent.emit(NftCheckoutEventOnReceived.Initiated, '0x1234');

  expect(response.status).toBe('processed');

  const requestPayload = magic.nft.request.mock.calls[0][0];

  expect(requestPayload.method).toBe('magic_nft_checkout');
  expect(requestPayload.params).toMatchObject([
    {
      contractId: '1cd4cfe8-b997-466e-8b0d-ff1177222ba4',
      contractAddress: '0x375625833431b22623ce222e55b1cd15a459ba49',
      tokenId: '1',
      name: 'NFT Checkout Test',
      imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/382ceb42f28fb4df0d12897d5d433084',
      quantity: 1,
      isCryptoCheckoutEnabled: true,
    },
  ]);
});
