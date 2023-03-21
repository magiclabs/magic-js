import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Sends `wallet_connected` intermediary event to iframe', async () => {
  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      setItem: async () => null,
    };
  });
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();
  magic.wallet.connectToThirdPartyWallet = jest.fn(() => '0x');
  const response = await magic.wallet.handleWalletSelected({ wallet: 'metamask', payloadId: 1, showModal: false });
  expect(response).toBe(undefined);
});

test('Sends `wallet_rejected` intermediary event to iframe', async () => {
  jest.mock('@magic-sdk/provider/src/util/storage.ts', () => {
    return {
      setItem: async () => null,
    };
  });
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();
  const response = await magic.wallet.handleWalletSelected({ wallet: 'metamask', payloadId: 1, showModal: false });
  expect(response).toBe(undefined);
});
