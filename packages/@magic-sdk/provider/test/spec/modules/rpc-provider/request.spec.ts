import browserEnv from '@ikscodes/browser-env';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

const requestPayload: JsonRpcRequestPayload = {
  jsonrpc: '2.0',
  id: 1,
  params: [],
  method: 'foobar',
};

beforeEach(() => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = jest.fn();
});

test('Calls `BaseModule.request` WITHOUT test-mode prefix', async () => {
  const magic = createMagicSDK();

  await magic.rpcProvider.request(requestPayload);

  expect((BaseModule as any).prototype.request.mock.calls[0][0]).toEqual(requestPayload);
});

test('Calls `BaseModule.request` WITH test-mode prefix', async () => {
  const magic = createMagicSDKTestMode();

  await magic.rpcProvider.request(requestPayload);

  expect((BaseModule as any).prototype.request.mock.calls[0][0]).toEqual({
    ...requestPayload,
    method: 'testMode/eth/foobar',
  });
});
