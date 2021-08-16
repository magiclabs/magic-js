import { isJsonRpcRequestPayload } from '../../../../src/util/type-guards';

test('Given `undefined`, returns false', async () => {
  expect(isJsonRpcRequestPayload(undefined)).toBe(false);
});

test('Given `null`, returns false', async () => {
  expect(isJsonRpcRequestPayload(null)).toBe(false);
});

test('Given without `JsonRpcRequestPayload.jsonrpc`, returns false', async () => {
  expect(isJsonRpcRequestPayload({ id: 1, params: [], method: '' } as any)).toBe(false);
});

test('Given without `JsonRpcRequestPayload.id`, returns false', async () => {
  expect(isJsonRpcRequestPayload({ jsonrpc: '2.0', params: [], method: '' } as any)).toBe(false);
});

test('Given without `JsonRpcRequestPayload.params`, returns false', async () => {
  expect(isJsonRpcRequestPayload({ jsonrpc: '2.0', id: 1, method: '' } as any)).toBe(false);
});

test('Given without `JsonRpcRequestPayload.method`, returns false', async () => {
  expect(isJsonRpcRequestPayload({ jsonrpc: '2.0', id: 1, params: [] } as any)).toBe(false);
});

test('Given full `JsonRpcRequestPayload`, returns true', async () => {
  expect(isJsonRpcRequestPayload({ jsonrpc: '2.0', id: 1, params: [], method: '' } as any)).toBe(true);
});
