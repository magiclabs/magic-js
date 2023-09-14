import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `eth_sendGaslessTransaction`', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const address = '0x1234';
  const sericalizedTranasction = '0x1234567890abcdef';

  magic.wallet.sendGaslessTransaction(address, sericalizedTranasction);

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('eth_sendGaslessTransaction');
  expect(requestPayload.params).toEqual([address, sericalizedTranasction]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();

  const address = '0x1234';
  const sericalizedTranasction = '0x1234567890abcdef';

  expect(isPromiEvent(magic.wallet.sendGaslessTransaction(address, sericalizedTranasction))).toBeTruthy();
});
