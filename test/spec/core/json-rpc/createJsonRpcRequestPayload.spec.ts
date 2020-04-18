import test from 'ava';
import { createJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { getPayloadIdStub } from '../../../mocks';

/**
 * `createJsonRpcRequestPayload`
 *
 * Action must:
 * - Create valid JSON RPC payload using array of parameters
 */
test('#01', t => {
  const randomIdStub = getPayloadIdStub();
  randomIdStub.returns(1);

  const payload = createJsonRpcRequestPayload('test', ['booyah!']);

  const expectedPayload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'test',
    params: ['booyah!'],
  };

  t.deepEqual(payload, expectedPayload);
});

/**
 * `createJsonRpcRequestPayload`
 *
 * Action must:
 * - Create valid JSON RPC payload when parameters are undefined
 */
test('#02', t => {
  const randomIdStub = getPayloadIdStub();
  randomIdStub.returns(1);

  const payload = createJsonRpcRequestPayload('test');

  const expectedPayload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'test',
    params: [],
  };

  t.deepEqual(payload, expectedPayload);
});
