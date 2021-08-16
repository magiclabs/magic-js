import { createJsonRpcRequestPayload } from '../../../../src/core/json-rpc';

test('Create valid JSON RPC payload using array of parameters', () => {
  const payload = createJsonRpcRequestPayload('test', ['booyah!']);

  const expectedPayload = {
    jsonrpc: '2.0',
    method: 'test',
    params: ['booyah!'],
  };

  expect(payload.jsonrpc).toEqual(expectedPayload.jsonrpc);
  expect(payload.method).toEqual(expectedPayload.method);
  expect(payload.params).toEqual(expectedPayload.params);
});

test('Create valid JSON RPC payload when parameters are undefined', () => {
  const payload = createJsonRpcRequestPayload('test');

  const expectedPayload = {
    jsonrpc: '2.0',
    method: 'test',
    params: [],
  };

  expect(payload.jsonrpc).toEqual(expectedPayload.jsonrpc);
  expect(payload.method).toEqual(expectedPayload.method);
  expect(payload.params).toEqual(expectedPayload.params);
});
