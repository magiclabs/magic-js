import { standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { getPayloadIdStub } from '../../../mocks';

test('Mutate the payload object given as the argument', () => {
  const originalPayload = {};
  const finalPayload = standardizeJsonRpcRequestPayload(originalPayload);
  expect(originalPayload).toBe(finalPayload);
});

test('Create a JSON RPC payload, preserving the current value of `payload.jsonrpc`', () => {
  const payload = standardizeJsonRpcRequestPayload({ jsonrpc: 'hello world' });
  expect(payload.jsonrpc).toBe('hello world');
});

test('Create a JSON RPC payload, replacing the missing value of `payload.jsonrpc`', () => {
  const payload = standardizeJsonRpcRequestPayload({});
  expect(payload.jsonrpc).toBe('2.0');
});

test('Create a JSON RPC payload, replacing the value of `payload.id`', () => {
  const payload = standardizeJsonRpcRequestPayload({ jsonrpc: '2.0', method: 'test', params: ['hello world'] });

  const expectedPayload = {
    jsonrpc: '2.0',
    method: 'test',
    params: ['hello world'],
  };

  expect(payload.jsonrpc).toEqual(expectedPayload.jsonrpc);
  expect(payload.method).toEqual(expectedPayload.method);
  expect(payload.params).toEqual(expectedPayload.params);
});

test('Create a JSON RPC payload, preserving the current value of `payload.method`', () => {
  const payload = standardizeJsonRpcRequestPayload({ method: 'test' });
  expect(payload.method).toBe('test');
});

test('Create a JSON RPC payload, replacing the missing value of `payload.method`', () => {
  const payload = standardizeJsonRpcRequestPayload({});
  expect(payload.method).toBe('noop');
});

test('Create a JSON RPC payload, preserving the current value of `payload.params`', () => {
  const payload = standardizeJsonRpcRequestPayload({ params: ['test'] });
  expect(payload.params).toEqual(['test']);
});

test('Create a JSON RPC payload, replacing the missing value of `payload.params`', () => {
  const payload = standardizeJsonRpcRequestPayload({});
  expect(payload.params).toEqual([]);
});

test('Calling upon the same payload twice does not mutate the payload ID', () => {
  const originalPayload: any = {};

  standardizeJsonRpcRequestPayload(originalPayload);
  const savedID = originalPayload.id;
  expect(savedID).toBeDefined();
  standardizeJsonRpcRequestPayload(originalPayload);
  expect(originalPayload.id).toBe(savedID);
});
