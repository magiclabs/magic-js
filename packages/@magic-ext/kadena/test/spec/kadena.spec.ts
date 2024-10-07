import browserEnv from '@ikscodes/browser-env';
import { KadenaPayloadMethod } from '../../src/types';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { KadenaExtension } from '../../src';

beforeEach(() => {
  browserEnv.restore();
});

test('Sends params as payload', () => {
  const magic = createMagicSDKWithExtension({}, [
    new KadenaExtension({
      rpcUrl: '',
      chainId: '1',
      networkId: 'testnet04',
      network: 'testnet',
      createAccountsOnChain: true,
    }),
  ]);
  magic.kadena.request = jest.fn();

  const params = '0x123';

  magic.kadena.signTransaction(params);

  const requestPayload = magic.kadena.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(KadenaPayloadMethod.KadenaSignTransaction);
  expect(requestPayload.params).toEqual([{ hash: '0x123' }]);
});
