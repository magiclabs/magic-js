/* eslint-disable no-underscore-dangle, @typescript-eslint/no-empty-function */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { getPayloadIdStub } from '../../../mocks';
import { RPCProviderModule } from '../../../../src/modules/rpc-provider';
import { createSynchronousWeb3MethodWarning } from '../../../../src/core/sdk-exceptions';

test.beforeEach((t) => {
  browserEnv.restore();
  (RPCProviderModule as any).prototype.request = sinon.stub();
  (RPCProviderModule as any).prototype.sendAsync = sinon.stub();
});

test.serial('Async, with payload method (as string); uses fallback `params` argument', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.rpcProvider.send('eth_call');

  const requestPayload = (magic.rpcProvider as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'eth_call');
  t.deepEqual(requestPayload.params, []);
});

test.serial('Async, with payload method (as string); uses given `params` argument', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.rpcProvider.send('eth_call', ['hello world']);

  const requestPayload = (magic.rpcProvider as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'eth_call');
  t.deepEqual(requestPayload.params, ['hello world']);
});

test.serial('Async, with full RPC payload + callback', async (t) => {
  const magic = createMagicSDK();

  const onRequestComplete = () => {};
  magic.rpcProvider.send({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] }, onRequestComplete);

  const requestPayload = (magic.rpcProvider as any).sendAsync.args[0][0];
  const expectedCallback = (magic.rpcProvider as any).sendAsync.args[0][1];
  t.is(requestPayload.id, 1);
  t.is(requestPayload.method, 'eth_call');
  t.deepEqual(requestPayload.params, ['hello world']);
  t.is(onRequestComplete, expectedCallback);
});

test.serial('Async, with batch RPC payload + callback', async (t) => {
  const magic = createMagicSDK();

  const onRequestComplete = () => {};
  const payload1 = { jsonrpc: '2.0', id: 1, method: 'first', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'second', params: ['goodbye world'] };
  magic.rpcProvider.send([payload1, payload2], onRequestComplete);

  const requestPayload = (magic.rpcProvider as any).sendAsync.args[0][0];
  const expectedCallback = (magic.rpcProvider as any).sendAsync.args[0][1];
  t.is(requestPayload[0].id, 1);
  t.is(requestPayload[0].method, 'first');
  t.deepEqual(requestPayload[0].params, ['hello world']);
  t.is(requestPayload[1].id, 2);
  t.is(requestPayload[1].method, 'second');
  t.deepEqual(requestPayload[1].params, ['goodbye world']);
  t.is(onRequestComplete, expectedCallback);
});

test.serial('Sync (legacy behavior), with full RPC payload and no callback', async (t) => {
  const magic = createMagicSDK();

  const consoleWarnStub = sinon.stub();
  browserEnv.stub('console.warn', consoleWarnStub);

  const result = magic.rpcProvider.send({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] });
  const expectedWarning = createSynchronousWeb3MethodWarning();

  t.is(result.jsonrpc, '2.0');
  t.is(result.id, 1);
  t.is(result.error.code, -32603);
  t.is(result.error.message, expectedWarning.rawMessage);
  t.true(consoleWarnStub.calledWith(expectedWarning.message));
});
