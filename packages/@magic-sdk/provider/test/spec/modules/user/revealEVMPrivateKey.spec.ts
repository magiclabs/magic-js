import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  jest.resetAllMocks();
});

test('revealEVMPrivateKey generates JSON RPC request payload with method `magic_reveal_key`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.revealEVMPrivateKey();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_reveal_key');
  expect(requestPayload.params).toEqual([{ chain: 'ETH' }]);
});

test('revealEVMPrivateKey should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.revealEVMPrivateKey())).toBeTruthy();
});

test('revealPrivateKey throws decommissioned error', () => {
  const magic = createMagicSDK();

  expect(() => magic.user.revealPrivateKey()).toThrow(
    'revealPrivateKey() has been decommissioned. For EVM chains, use `user.revealEVMPrivateKey()` instead. For non-EVM chains, use `[extension].revealPrivateKey()` instead.',
  );
});
