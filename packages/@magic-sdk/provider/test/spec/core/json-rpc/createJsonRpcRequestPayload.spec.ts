import { createJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { getPayloadIdStub } from '../../../mocks';

test('Create valid JSON RPC payload using array of parameters', () => {
  const randomIdStub = getPayloadIdStub();
  randomIdStub.returns(1);

  const payload = createJsonRpcRequestPayload('test', ['booyah!']);

  const expectedPayload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'test',
    params: ['booyah!'],
  };

  expect(payload).toEqual(expectedPayload);
});

test('Create valid JSON RPC payload when parameters are undefined', () => {
  const randomIdStub = getPayloadIdStub();
  randomIdStub.returns(1);

  const payload = createJsonRpcRequestPayload('test');

  const expectedPayload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'test',
    params: [],
  };

  expect(payload).toEqual(expectedPayload);
});
