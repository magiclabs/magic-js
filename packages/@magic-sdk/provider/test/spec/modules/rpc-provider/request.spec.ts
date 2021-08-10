/* eslint-disable global-require */

import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
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
  (BaseModule as any).prototype.request = sinon.stub();
});

test('Calls `BaseModule.request` WITHOUT test-mode prefix', async () => {
  const magic = createMagicSDK();

  await (magic.rpcProvider as any).request(requestPayload);

  expect((BaseModule as any).prototype.request.args[0][0]).toEqual(requestPayload);
});

test('Calls `BaseModule.request` WITH test-mode prefix', async () => {
  const magic = createMagicSDKTestMode();

  await (magic.rpcProvider as any).request(requestPayload);

  expect((BaseModule as any).prototype.request.args[0][0]).toEqual({
    ...requestPayload,
    method: 'testMode/eth/foobar',
  });
});
