import test from 'ava';
import { standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { getPayloadIdStub } from '../../../mocks';

test('Mutate the payload object given as the argument', (t) => {
  const originalPayload = {};
  const finalPayload = standardizeJsonRpcRequestPayload(originalPayload);
  t.is(originalPayload, finalPayload);
});

test('Create a JSON RPC payload, preserving the current value of `payload.jsonrpc`', (t) => {
  const payload = standardizeJsonRpcRequestPayload({ jsonrpc: 'hello world' });
  t.is(payload.jsonrpc, 'hello world');
});

test('Create a JSON RPC payload, replacing the missing value of `payload.jsonrpc`', (t) => {
  const payload = standardizeJsonRpcRequestPayload({});
  t.is(payload.jsonrpc, '2.0');
});

test('Create a JSON RPC payload, replacing the value of `payload.id`', (t) => {
  const randomIdStub = getPayloadIdStub();
  randomIdStub.returns(999);

  const payload = standardizeJsonRpcRequestPayload({ jsonrpc: '2.0', method: 'test', params: ['hello world'] });

  const expectedPayload = {
    jsonrpc: '2.0',
    id: 999,
    method: 'test',
    params: ['hello world'],
  };

  t.deepEqual(payload, expectedPayload);
});

test('Create a JSON RPC payload, preserving the current value of `payload.method`', (t) => {
  const payload = standardizeJsonRpcRequestPayload({ method: 'test' });
  t.is(payload.method, 'test');
});

test('Create a JSON RPC payload, replacing the missing value of `payload.method`', (t) => {
  const payload = standardizeJsonRpcRequestPayload({});
  t.is(payload.method, 'noop');
});

test('Create a JSON RPC payload, preserving the current value of `payload.params`', (t) => {
  const payload = standardizeJsonRpcRequestPayload({ params: ['test'] });
  t.deepEqual(payload.params, ['test']);
});

test('Create a JSON RPC payload, replacing the missing value of `payload.params`', (t) => {
  const payload = standardizeJsonRpcRequestPayload({});
  t.deepEqual(payload.params, []);
});

test('Calling upon the same payload twice does not mutate the payload ID', (t) => {
  const originalPayload = {
    id: 999,
  };

  const randomIdStub = getPayloadIdStub();
  randomIdStub.onFirstCall().returns(1);
  randomIdStub.onSecondCall().returns(2);

  standardizeJsonRpcRequestPayload(originalPayload);

  t.is(originalPayload.id, 1);

  standardizeJsonRpcRequestPayload(originalPayload);

  t.is(originalPayload.id, 1);
});
