import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_reveal_key`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.revealPrivateKey();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_reveal_key');
  expect(requestPayload.params).toEqual([]);
});

test('Method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.revealPrivateKey())).toBeTruthy();
});
