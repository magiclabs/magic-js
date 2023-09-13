import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_send_gasless_transaction`', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const sericalizedTranasction = '0x1234567890abcdef';

  magic.wallet.sendGaslessTransaction(sericalizedTranasction);

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_send_gasless_transaction');
  expect(requestPayload.params).toEqual([
    {
      serialized: '0x1234567890abcdef',
    },
  ]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();

  const sericalizedTranasction = '0x1234567890abcdef';

  expect(isPromiEvent(magic.wallet.sendGaslessTransaction(sericalizedTranasction))).toBeTruthy();
});
