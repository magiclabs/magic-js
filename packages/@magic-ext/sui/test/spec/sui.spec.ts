import browserEnv from '@ikscodes/browser-env';
import { SuiExtension } from '../../src/index';
import { SuiPayloadMethod } from '../../src/types';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Sends params as payload', async () => {
  const magic = createMagicSDKWithExtension({}, [new SuiExtension({ rpcUrl: 'devnet' })]);
  magic.sui.request = jest.fn();

  const params = 'hello world';

  magic.sui.signAndSendTransaction(params);

  const requestPayload = magic.sui.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(SuiPayloadMethod.SuiSignAndSendTransaction);
  expect(requestPayload.params).toEqual(params);
});
