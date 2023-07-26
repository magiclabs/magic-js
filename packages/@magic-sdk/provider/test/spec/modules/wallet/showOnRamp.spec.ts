import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_show_fiat_onramp`', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  magic.wallet.showOnRamp();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_show_fiat_onramp');
  expect(requestPayload.params).toEqual([]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.wallet.showOnRamp())).toBeTruthy();
});
