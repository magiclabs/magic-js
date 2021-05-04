/* eslint-disable global-require */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
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

test.beforeEach((t) => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test.serial('Calls `BaseModule.request` WITHOUT test-mode prefix', async (t) => {
  const magic = createMagicSDK();

  await (magic.rpcProvider as any).request(requestPayload);

  t.deepEqual((BaseModule as any).prototype.request.args[0][0], requestPayload);
});

test.serial('Calls `BaseModule.request` WITH test-mode prefix', async (t) => {
  const magic = createMagicSDKTestMode();

  await (magic.rpcProvider as any).request(requestPayload);

  t.deepEqual((BaseModule as any).prototype.request.args[0][0], { ...requestPayload, method: 'testMode/eth/foobar' });
});
