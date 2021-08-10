/* eslint-disable no-underscore-dangle, @typescript-eslint/no-empty-function */

import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { createMagicSDK } from '../../../factories';
import { MagicSDKError } from '../../../../src/core/sdk-exceptions';
import { getPayloadIdStub } from '../../../mocks';

beforeEach(() => {
  browserEnv.restore();
});

test('Throws INVALID_ARGUMENT error if `onRequestCallback` argument is `undefined`', () => {
  const magic = createMagicSDK();

  const error: MagicSDKError = expect(() => magic.rpcProvider.sendAsync({} as any, undefined as any)).toThrow();

  expect(error.rawMessage).toBe(
    'Invalid 2nd argument given to `Magic.rpcProvider.sendAsync`.\n  Expected: `function`\n  Received: `undefined`',
  );
  expect(error.code).toBe('INVALID_ARGUMENT');
});

test('Throws INVALID_ARGUMENT error if `onRequestCallback` argument is `null`', () => {
  const magic = createMagicSDK();

  const error: MagicSDKError = expect(() => magic.rpcProvider.sendAsync({} as any, null as any)).toThrow();

  expect(error.rawMessage).toBe(
    'Invalid 2nd argument given to `Magic.rpcProvider.sendAsync`.\n  Expected: `function`\n  Received: `null`',
  );
  expect(error.code).toBe('INVALID_ARGUMENT');
});

test('Async, with full RPC payload + callback; success response', (done) => {
  const magic = createMagicSDK();

  const postStub = sinon.stub();
  postStub.returns(Promise.resolve({ hasError: false, payload: 'test' }));
  (magic.rpcProvider as any).transport.post = postStub;

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const onRequestComplete = sinon.spy((error, response) => {
    expect(error).toBe(null);
    expect(response).toEqual('test');
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);

  const [overlay, msgType, requestPayload] = postStub.args[0];

  expect(overlay).toBe((magic.rpcProvider as any).overlay);
  expect(msgType).toBe('MAGIC_HANDLE_REQUEST');
  expect(requestPayload.id).toBe(999);
  expect(requestPayload.method).toBe('eth_call');
  expect(requestPayload.params).toEqual(['hello world']);
});

test('Async, with full RPC payload + callback; error response', (done) => {
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
    expect(error.code).toBe(-32603);
    expect(error.rawMessage).toBe('test');
    expect(response).toEqual({ error: { code: -32603, message: 'test' }, result: null });
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);

  const [overlay, msgType, requestPayload] = postStub.args[0];

  expect(overlay).toBe((magic.rpcProvider as any).overlay);
  expect(msgType).toBe('MAGIC_HANDLE_REQUEST');
  expect(requestPayload.id).toBe(999);
  expect(requestPayload.method).toBe('eth_call');
  expect(requestPayload.params).toEqual(['hello world']);
});

test('Async, with batch RPC payload + callback; success responses', (done) => {
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
    expect(_).toBe(null);
    expect(responses).toEqual([
      { result: 'test1', error: null },
      { result: 'test2', error: null },
    ]);
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);

  const [overlay, msgType, requestPayloads] = postStub.args[0];

  expect(overlay).toBe((magic.rpcProvider as any).overlay);
  expect(msgType).toBe('MAGIC_HANDLE_REQUEST');
  expect(requestPayloads[0].id).toBe(123);
  expect(requestPayloads[0].method).toBe('eth_call');
  expect(requestPayloads[0].params).toEqual(['hello world']);
  expect(requestPayloads[1].id).toBe(456);
  expect(requestPayloads[1].method).toBe('eth_call');
  expect(requestPayloads[1].params).toEqual(['hello world']);
});

test('Async, with full RPC payload + callback; error responses', (done) => {
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
    expect(_).toBe(null);
    expect(responses[0].error.code).toBe(-32603);
    expect(responses[0].error.rawMessage).toBe('test1');
    expect(responses[1].error.code).toBe(-32603);
    expect(responses[1].error.rawMessage).toBe('test2');
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);

  const [overlay, msgType, requestPayloads] = postStub.args[0];

  expect(overlay).toBe((magic.rpcProvider as any).overlay);
  expect(msgType).toBe('MAGIC_HANDLE_REQUEST');
  expect(requestPayloads[0].id).toBe(123);
  expect(requestPayloads[0].method).toBe('eth_call');
  expect(requestPayloads[0].params).toEqual(['hello world']);
  expect(requestPayloads[1].id).toBe(456);
  expect(requestPayloads[1].method).toBe('eth_call');
  expect(requestPayloads[1].params).toEqual(['hello world']);
});
