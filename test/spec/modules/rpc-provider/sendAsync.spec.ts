/* eslint-disable no-underscore-dangle, @typescript-eslint/no-empty-function */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createMagicSDK } from '../../../factories';
import { MagicSDKError } from '../../../../src/core/sdk-exceptions';
import { getPayloadIdStub } from '../../../mocks';

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * Throws 'INVALID_ARGUMENT' error if 'onRequestCallback' argument is
 * `undefined`.
 *
 * Action Must:
 * - Throw 'INVALID_ARGUMENT' error.
 */
test.serial('#01', t => {
  const magic = createMagicSDK();

  const error: MagicSDKError = t.throws(() => magic.rpcProvider.sendAsync({} as any, undefined as any));

  t.is(
    error.rawMessage,
    'Invalid 2nd argument given to `Magic.rpcProvider.sendAsync`.\n  Expected: `function`\n  Received: `undefined`',
  );
  t.is(error.code, 'INVALID_ARGUMENT');
});

/**
 * Throws 'INVALID_ARGUMENT' error if 'onRequestCallback' argument is
 * `null`.
 *
 * Action Must:
 * - Throw 'INVALID_ARGUMENT' error.
 */
test.serial('#02', t => {
  const magic = createMagicSDK();

  const error: MagicSDKError = t.throws(() => magic.rpcProvider.sendAsync({} as any, null as any));

  t.is(
    error.rawMessage,
    'Invalid 2nd argument given to `Magic.rpcProvider.sendAsync`.\n  Expected: `function`\n  Received: `null`',
  );
  t.is(error.code, 'INVALID_ARGUMENT');
});

/**
 * Send asynchronously using RPC payload + callback.
 *
 * Action Must:
 * - Send with the supplied payload.
 * - Response contains a result and no error.
 */
test.serial.cb('#03', t => {
  const magic = createMagicSDK();

  const postStub = sinon.stub();
  postStub.returns(Promise.resolve({ hasError: false, payload: 'test' }));
  (magic.rpcProvider as any).transport.post = postStub;

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const onRequestComplete = sinon.spy((error, response) => {
    t.is(error, null);
    t.deepEqual(response, 'test');
    t.end();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);

  const [overlay, msgType, requestPayload] = postStub.args[0];

  t.is(overlay, (magic.rpcProvider as any).overlay);
  t.is(msgType, 'MAGIC_HANDLE_REQUEST');
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'eth_call');
  t.deepEqual(requestPayload.params, ['hello world']);
});

/**
 * Send asynchronously using RPC payload + callback.
 *
 * Action Must:
 * - Send with the supplied payload.
 * - Response contains an error and no result.
 */
test.serial.cb('#04', t => {
  const magic = createMagicSDK();

  const postStub = sinon.stub();
  postStub.returns(
    Promise.resolve({ hasError: true, payload: { error: { code: -32603, message: 'test' }, result: null } }),
  );
  (magic.rpcProvider as any).transport.post = postStub;

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const onRequestComplete = sinon.spy((error, response) => {
    t.is(error.code, -32603);
    t.is(error.rawMessage, 'test');
    t.deepEqual(response, { error: { code: -32603, message: 'test' }, result: null });
    t.end();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);

  const [overlay, msgType, requestPayload] = postStub.args[0];

  t.is(overlay, (magic.rpcProvider as any).overlay);
  t.is(msgType, 'MAGIC_HANDLE_REQUEST');
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'eth_call');
  t.deepEqual(requestPayload.params, ['hello world']);
});

/**
 * Send asynchronously using batch RPC payload + callback.
 *
 * Action Must:
 * - Send with the supplied payloads.
 * - Responses contain results and no errors.
 */
test.serial.cb('#05', t => {
  const magic = createMagicSDK();

  const postStub = sinon.stub();
  const response1 = { hasError: false, payload: { result: 'test1' } };
  const response2 = { hasError: false, payload: { result: 'test2' } };
  postStub.returns(Promise.resolve([response1, response2]));
  (magic.rpcProvider as any).transport.post = postStub;

  const idStub = getPayloadIdStub();
  idStub.onFirstCall().returns(123);
  idStub.onSecondCall().returns(456);

  const payload1 = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'eth_call', params: ['hello world'] };
  const onRequestComplete = sinon.spy((_, responses) => {
    t.is(_, null);
    t.deepEqual(responses, [
      { result: 'test1', error: null },
      { result: 'test2', error: null },
    ]);
    t.end();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);

  const [overlay, msgType, requestPayloads] = postStub.args[0];

  t.is(overlay, (magic.rpcProvider as any).overlay);
  t.is(msgType, 'MAGIC_HANDLE_REQUEST');
  t.is(requestPayloads[0].id, 123);
  t.is(requestPayloads[0].method, 'eth_call');
  t.deepEqual(requestPayloads[0].params, ['hello world']);
  t.is(requestPayloads[1].id, 456);
  t.is(requestPayloads[1].method, 'eth_call');
  t.deepEqual(requestPayloads[1].params, ['hello world']);
});

/**
 * Send asynchronously using batch RPC payload + callback.
 *
 * Action Must:
 * - Send with the supplied payloads.
 * - Responses contain errors and no results.
 */
test.serial.cb('#06', t => {
  const magic = createMagicSDK();

  const postStub = sinon.stub();
  const response1 = { hasError: true, payload: { error: { code: -32603, message: 'test1' }, result: null } };
  const response2 = { hasError: true, payload: { error: { code: -32603, message: 'test2' }, result: null } };
  postStub.returns(Promise.resolve([response1, response2]));
  (magic.rpcProvider as any).transport.post = postStub;

  const idStub = getPayloadIdStub();
  idStub.onFirstCall().returns(123);
  idStub.onSecondCall().returns(456);

  const payload1 = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'eth_call', params: ['hello world'] };
  const onRequestComplete = sinon.spy((_, responses) => {
    t.is(_, null);
    t.is(responses[0].error.code, -32603);
    t.is(responses[0].error.rawMessage, 'test1');
    t.is(responses[1].error.code, -32603);
    t.is(responses[1].error.rawMessage, 'test2');
    t.end();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);

  const [overlay, msgType, requestPayloads] = postStub.args[0];

  t.is(overlay, (magic.rpcProvider as any).overlay);
  t.is(msgType, 'MAGIC_HANDLE_REQUEST');
  t.is(requestPayloads[0].id, 123);
  t.is(requestPayloads[0].method, 'eth_call');
  t.deepEqual(requestPayloads[0].params, ['hello world']);
  t.is(requestPayloads[1].id, 456);
  t.is(requestPayloads[1].method, 'eth_call');
  t.deepEqual(requestPayloads[1].params, ['hello world']);
});
