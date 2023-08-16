import browserEnv from '@ikscodes/browser-env';
import { HarmonyPayloadMethod } from '../../src/types';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { HarmonyExtension } from '../../src';

beforeEach(() => {
  browserEnv.restore();
});

test('Sends params as payload', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new HarmonyExtension({
      rpcUrl: 'https://api.s0.b.hmny.io',
      chainId: '2',
    } as any),
  ]);
  magic.harmony.request = jest.fn();

  const params = 'hello world';

  magic.harmony.sendTransaction(params);

  const requestPayload = magic.harmony.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(HarmonyPayloadMethod.HarmonySignTransaction);
  expect(requestPayload.params).toEqual(params);
});
