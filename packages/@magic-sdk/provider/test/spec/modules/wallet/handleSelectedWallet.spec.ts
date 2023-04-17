import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Sends `wallet_connected` intermediary event to iframe', async () => {
  const magic = createMagicSDK();
  magic.wallet.connectToThirdPartyWallet = jest.fn().mockResolvedValue('0x123456');
  magic.wallet.request = jest.fn();

  await magic.wallet.handleWalletSelected({ wallet: 'metamask', payloadId: 1 });
  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_intermediary_event');
  expect(requestPayload.params[0].eventType).toBe('wallet_connected');
});

test('Sends `wallet_rejected` intermediary event to iframe', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  magic.wallet.handleWalletSelected({ wallet: 'metamask', payloadId: 1 });

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_intermediary_event');
  expect(requestPayload.params[0].eventType).toBe('wallet_rejected');
});
