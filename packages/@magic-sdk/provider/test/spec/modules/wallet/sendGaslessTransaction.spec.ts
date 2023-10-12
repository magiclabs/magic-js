import browserEnv from '@ikscodes/browser-env';
import { GaslessTransactionRequest } from '@magic-sdk/types';
import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `eth_sendGaslessTransaction`', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const address = '0x1234';
  const transaction: GaslessTransactionRequest = {
    from: '0x1234',
    to: '0x5678',
    value: BigInt('12'),
  };

  magic.wallet.sendGaslessTransaction(address, transaction);

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('eth_sendGaslessTransaction');
  expect(requestPayload.params).toEqual([address, transaction]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();

  const address = '0x1234';
  const transaction: GaslessTransactionRequest = {
    from: '0x1234',
    to: '0x5678',
    value: BigInt('12'),
  };

  expect(isPromiEvent(magic.wallet.sendGaslessTransaction(address, transaction))).toBeTruthy();
});
