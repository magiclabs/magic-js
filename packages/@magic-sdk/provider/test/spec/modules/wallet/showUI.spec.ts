import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_wallet`', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  magic.wallet.showUI();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_wallet');
  expect(requestPayload.params).toEqual([undefined]);
});

test('Generate JSON RPC request payload with method `magic_wallet` with onramperParams', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  magic.wallet.showUI({ onramperParams: { onlyCryptos: 'matic_polygon' } });

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_wallet');
  expect(requestPayload.params).toEqual([{ onramperParams: { onlyCryptos: 'matic_polygon' } }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.wallet.showUI())).toBeTruthy();
});
