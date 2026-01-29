import { createMagicSDK } from '../../../factories';
import { createInvalidArgumentError } from '../../../../src/core/sdk-exceptions';
import { JsonRpcResponse, standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';

beforeEach(() => {
  jest.resetAllMocks();
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

  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyResult('test'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((error, response) => {
    expect(error).toBe(null);
    expect(response).toEqual({ jsonrpc: '2.0', id: expect.any(Number), result: 'test', error: null });
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

  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyError({ code: -32603, message: 'test' }));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn().mockImplementation((error, response) => {
    expect(error.code).toBe(-32603);
    expect(error.rawMessage).toBe('test');
    expect(response).toEqual({ jsonrpc: '2.0', id: expect.any(Number), error: expect.any(Error) });
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

  const payload1 = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'eth_call', params: ['hello world'] };
  
  // sendAsync calls this.request() for each payload individually, so overlay.post is called multiple times
  let callCount = 0;
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    callCount++;
    const response = new JsonRpcResponse(requestPayload);
    // Return different results for each call
    return Promise.resolve(response.applyResult(callCount === 1 ? 'test1' : 'test2'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    expect(responses).toEqual([
      { result: 'test1', error: null, jsonrpc: '2.0', id: expect.any(Number) },
      { result: 'test2', error: null, jsonrpc: '2.0', id: expect.any(Number) },
    ]);
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);
});

test('Async, with batch RPC payload + callback; error responses', done => {
  const magic = createMagicSDK();

  const payload1 = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'eth_call', params: ['hello world'] };
  
  let callCount = 0;
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    callCount++;
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyError({ code: -32603, message: callCount === 1 ? 'test1' : 'test2' }));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    // When request() rejects with MagicRPCError, it's caught and put in the response
    expect(responses[0].error).toBeInstanceOf(Error);
    expect(responses[0].error.code).toBe(-32603);
    expect(responses[0].error.rawMessage).toBe('test1');
    expect(responses[1].error).toBeInstanceOf(Error);
    expect(responses[1].error.code).toBe(-32603);
    expect(responses[1].error.rawMessage).toBe('test2');
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);
});

test('Async, with batch RPC payload + callback; mixed success and error responses', done => {
  const magic = createMagicSDK();

  const payload1 = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'eth_call', params: ['hello world'] };
  
  let callCount = 0;
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    callCount++;
    const response = new JsonRpcResponse(requestPayload);
    if (callCount === 1) {
      return Promise.resolve(response.applyResult('test1'));
    } else {
      return Promise.resolve(response.applyError({ code: -32603, message: 'test2' }));
    }
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    expect(responses[0].result).toBe('test1');
    expect(responses[0].error).toBe(null);
    expect(responses[1].error).toBeInstanceOf(Error);
    expect(responses[1].error.code).toBe(-32603);
    expect(responses[1].error.rawMessage).toBe('test2');
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);
});

test('Async, with batch RPC payload + callback; error handling in catch path', done => {
  const magic = createMagicSDK();

  const payload1 = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'eth_call', params: ['hello world'] };
  
  let callCount = 0;
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    callCount++;
    // Second request fails
    if (callCount === 2) {
      return Promise.reject(new Error('Network error'));
    }
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyResult('test1'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    expect(responses.length).toBe(2);
    const successResponse = responses.find(r => r.result);
    const errorResponse = responses.find(r => r.error);
    expect(successResponse).toBeDefined();
    expect(errorResponse).toBeDefined();
    expect(errorResponse.error).toBeInstanceOf(Error);
    expect(errorResponse.error.message).toBe('Network error');
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);
});

test('Async, with full RPC payload + callback; error in catch path', done => {
  const magic = createMagicSDK();

  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] };
  const postStub = jest.fn().mockImplementation(() => {
    return Promise.reject(new Error('Network error'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn().mockImplementation((error, response) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Network error');
    expect(response).toEqual({ jsonrpc: '2.0', id: expect.any(Number), error: expect.any(Error) });
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);
});

test('Async, with payload missing jsonrpc field', done => {
  const magic = createMagicSDK();

  const payload = { id: 1, method: 'eth_call', params: ['hello world'] };
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyResult('test'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((error, response) => {
    expect(error).toBe(null);
    expect(response).toEqual({ jsonrpc: '2.0', id: expect.any(Number), result: 'test', error: null });
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);
});

test('Async, with payload missing id field', done => {
  const magic = createMagicSDK();

  const payload = { jsonrpc: '2.0', method: 'eth_call', params: ['hello world'] };
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyResult('test'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((error, response) => {
    expect(error).toBe(null);
    expect(response).toEqual({ jsonrpc: '2.0', id: expect.any(Number), result: 'test', error: null });
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);
});

test('Async, with batch payload missing jsonrpc and id fields', done => {
  const magic = createMagicSDK();

  const payload1 = { method: 'eth_call', params: ['hello world'] };
  const payload2 = { method: 'eth_call', params: ['goodbye world'] };
  
  let callCount = 0;
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    callCount++;
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyResult(callCount === 1 ? 'test1' : 'test2'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    expect(responses).toEqual([
      { result: 'test1', error: null, jsonrpc: '2.0', id: expect.any(Number) },
      { result: 'test2', error: null, jsonrpc: '2.0', id: expect.any(Number) },
    ]);
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);
});

test('Async, with batch payload missing jsonrpc and id fields; error in catch path', done => {
  const magic = createMagicSDK();

  const payload1 = { method: 'eth_call', params: ['hello world'] };
  const payload2 = { method: 'eth_call', params: ['goodbye world'] };
  
  let callCount = 0;
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    callCount++;
    if (callCount === 2) {
      return Promise.reject(new Error('Network error'));
    }
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyResult('test1'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    expect(responses.length).toBe(2);
    const successResponse = responses.find(r => r.result);
    const errorResponse = responses.find(r => r.error);
    expect(successResponse).toBeDefined();
    expect(errorResponse).toBeDefined();
    expect(errorResponse.error).toBeInstanceOf(Error);
    expect(errorResponse.error.message).toBe('Network error');
    // Verify jsonrpc and id are set even when missing from original payload
    expect(errorResponse.jsonrpc).toBe('2.0');
    expect(errorResponse.id).not.toBeNull();
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);
});

test('Async, with single payload missing jsonrpc and id fields; error in catch path', done => {
  const magic = createMagicSDK();

  const payload = { method: 'eth_call', params: ['hello world'] };
  const postStub = jest.fn().mockImplementation(() => {
    return Promise.reject(new Error('Network error'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((error, response) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Network error');
    // Verify jsonrpc and id are set even when missing from original payload
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).not.toBeNull();
    expect(response.error).toBeInstanceOf(Error);
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);
});

test('Async, with batch payload having null jsonrpc in error response', done => {
  const magic = createMagicSDK();

  // Create payloads and manually set jsonrpc to null after standardization would run
  const payload1: any = { method: 'eth_call', params: ['hello world'] };
  const payload2: any = { method: 'eth_call', params: ['goodbye world'] };
  
  let callCount = 0;
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    callCount++;
    if (callCount === 2) {
      // Manually set jsonrpc to null to test the ?? branch
      requestPayload.jsonrpc = null;
      return Promise.reject(new Error('Network error'));
    }
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyResult('test1'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    expect(responses.length).toBe(2);
    const errorResponse = responses.find(r => r.error);
    // Even if jsonrpc was null, it should default to '2.0' in the response
    expect(errorResponse.jsonrpc).toBe('2.0');
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);
});

test('Async, with single payload having null jsonrpc in error response', done => {
  const magic = createMagicSDK();

  const payload: any = { method: 'eth_call', params: ['hello world'] };
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    // Manually set jsonrpc to null to test the ?? branch
    requestPayload.jsonrpc = null;
    return Promise.reject(new Error('Network error'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((error, response) => {
    expect(error).toBeInstanceOf(Error);
    // Even if jsonrpc was null, it should default to '2.0' in the response
    expect(response.jsonrpc).toBe('2.0');
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);
});

test('Async, with single payload having null jsonrpc in success response', done => {
  const magic = createMagicSDK();

  const payload: any = { method: 'eth_call', params: ['hello world'] };
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    // Manually set jsonrpc to null to test the ?? branch in success path
    requestPayload.jsonrpc = null;
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyResult('test'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((error, response) => {
    expect(error).toBe(null);
    // Even if jsonrpc was null, it should default to '2.0' in the response
    expect(response.jsonrpc).toBe('2.0');
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);
});

test('Async, with single payload having null id in error response', done => {
  const magic = createMagicSDK();

  const payload: any = { method: 'eth_call', params: ['hello world'] };
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    // Manually set id to null to test the ?? branch
    requestPayload.id = null;
    return Promise.reject(new Error('Network error'));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((error, response) => {
    expect(error).toBeInstanceOf(Error);
    // Even if id was null, it should default to null in the response
    expect(response.id).toBe(null);
    done();
  });
  magic.rpcProvider.sendAsync(payload, onRequestComplete);
});

test('Async, with batch payload having null id in success response', done => {
  const magic = createMagicSDK();

  const payload1: any = { method: 'eth_call', params: ['hello world'] };
  const payload2: any = { method: 'eth_call', params: ['goodbye world'] };
  
  let callCount = 0;
  const postStub = jest.fn().mockImplementation((msgType, requestPayload) => {
    callCount++;
    // Manually set id to null to test the ?? branch in success path
    requestPayload.id = null;
    const response = new JsonRpcResponse(requestPayload);
    return Promise.resolve(response.applyResult(`test${callCount}`));
  });
  magic.rpcProvider.overlay.post = postStub;

  const onRequestComplete = jest.fn((_, responses) => {
    expect(_).toBe(null);
    expect(responses.length).toBe(2);
    // Even if id was null, it should default to null in the response
    expect(responses[0].id).toBe(null);
    expect(responses[1].id).toBe(null);
    done();
  });
  magic.rpcProvider.sendAsync([payload1, payload2], onRequestComplete);
});

