import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { createInvalidArgumentError } from '../../../../src/core/sdk-exceptions';

beforeEach(() => {
  browserEnv.restore();
});

test('Throws INVALID_ARGUMENT error if `onRequestCallback` argument is `undefined`', () => {
  const magic = createMagicSDK();

  const expectedError = createInvalidArgumentError({
    procedure: 'Magic.rpcProvider.sendAsync',
    argument: 1,
    expected: 'function',
    received: 'undefined',
  });

  expect(() => magic.rpcProvider.sendAsync({} as any, undefined as any)).toThrow(expectedError);
});

test('Throws INVALID_ARGUMENT error if `onRequestCallback` argument is `null`', () => {
  const magic = createMagicSDK();

  const expectedError = createInvalidArgumentError({
    procedure: 'Magic.rpcProvider.sendAsync',
    argument: 1,
    expected: 'function',
    received: 'null',
  });

  expect(() => magic.rpcProvider.sendAsync({} as any, null as any)).toThrow(expectedError);
});

test('Async, with full RPC payload + callback; success response', done => {
  const magic = createMagicSDK();

  const postStub = jest.fn().mockImplementation(() => Promise.resolve({ hasError: false, payload: 'test' }));
  magic.rpcProvider.overlay.post = postStub;

  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const onRequestComplete = jest.fn((error, response) => {
    expect(error).toBe(null);
    expect(response).toEqual('test');
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);

  const [msgType, requestPayload] = postStub.mock.calls[0];

  expect(msgType).toBe('MAGIC_HANDLE_REQUEST');
  expect(requestPayload.method).toBe('eth_call');
  expect(requestPayload.params).toEqual(['hello world']);
});

test('Async, with full RPC payload + callback; error response', done => {
  const magic = createMagicSDK();

  const postStub = jest.fn(() =>
    Promise.resolve({ hasError: true, payload: { error: { code: -32603, message: 'test' }, result: null } }),
  );
  magic.rpcProvider.overlay.post = postStub;

  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const onRequestComplete = jest.fn().mockImplementation((error, response) => {
    expect(error.code).toBe(-32603);
    expect(error.rawMessage).toBe('test');
    expect(response).toEqual({ error: { code: -32603, message: 'test' }, result: null });
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);

  const [msgType, requestPayload] = postStub.mock.calls[0] as any;

  expect(msgType).toBe('MAGIC_HANDLE_REQUEST');
  expect(requestPayload.method).toBe('eth_call');
  expect(requestPayload.params).toEqual(['hello world']);
});

test('Async, with batch RPC payload + callback; success responses', done => {
  const magic = createMagicSDK();

  const response1 = { hasError: false, payload: { result: 'test1' } };
  const response2 = { hasError: false, payload: { result: 'test2' } };
  const postStub = jest.fn().mockImplementation(() => Promise.resolve([response1, response2]));
  magic.rpcProvider.overlay.post = postStub;

  const payload1 = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'eth_call', params: ['hello world'] };
  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    expect(responses).toEqual([
      { result: 'test1', error: null },
      { result: 'test2', error: null },
    ]);
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);

  const [msgType, requestPayloads] = postStub.mock.calls[0];

  expect(msgType).toBe('MAGIC_HANDLE_REQUEST');
  expect(requestPayloads[0].method).toBe('eth_call');
  expect(requestPayloads[0].params).toEqual(['hello world']);
  expect(requestPayloads[1].method).toBe('eth_call');
  expect(requestPayloads[1].params).toEqual(['hello world']);
});

test('Async, with full RPC payload + callback; error responses', done => {
  const magic = createMagicSDK();

  const response1 = { hasError: true, payload: { error: { code: -32603, message: 'test1' }, result: null } };
  const response2 = { hasError: true, payload: { error: { code: -32603, message: 'test2' }, result: null } };
  const postStub = jest.fn().mockImplementation(() => Promise.resolve([response1, response2]));
  magic.rpcProvider.overlay.post = postStub;

  const payload1 = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'eth_call', params: ['hello world'] };
  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    expect(responses[0].error.code).toBe(-32603);
    expect(responses[0].error.rawMessage).toBe('test1');
    expect(responses[1].error.code).toBe(-32603);
    expect(responses[1].error.rawMessage).toBe('test2');
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);

  const [msgType, requestPayloads] = postStub.mock.calls[0];

  expect(msgType).toBe('MAGIC_HANDLE_REQUEST');
  expect(requestPayloads[0].method).toBe('eth_call');
  expect(requestPayloads[0].params).toEqual(['hello world']);
  expect(requestPayloads[1].method).toBe('eth_call');
  expect(requestPayloads[1].params).toEqual(['hello world']);
});
