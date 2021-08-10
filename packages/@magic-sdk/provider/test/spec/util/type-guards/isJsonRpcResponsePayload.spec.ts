import { isJsonRpcResponsePayload } from '../../../../src/util/type-guards';

test('Given `undefined`, returns false', async () => {
  expect(isJsonRpcResponsePayload(undefined)).toBe(false);
});

test('Given `null`, returns false', async () => {
  expect(isJsonRpcResponsePayload(null)).toBe(false);
});

test('Given without `JsonRpcResponsePayload.jsonrpc`, returns false', async () => {
  expect(isJsonRpcResponsePayload({ id: 1, result: 'hello' } as any)).toBe(false);
});

test('Given without `JsonRpcResponsePayload.id`, returns false', async () => {
  expect(isJsonRpcResponsePayload({ jsonrpc: '2.0', result: 'hello' } as any)).toBe(false);
});

test('Given without `JsonRpcResponsePayload.result`, returns false', async () => {
  expect(isJsonRpcResponsePayload({ jsonrpc: '2.0', id: 1 } as any)).toBe(false);
});

test('Given with `JsonRpcResponsePayload.result`, returns true', async () => {
  expect(isJsonRpcResponsePayload({ jsonrpc: '2.0', id: 1, result: 'hello' } as any)).toBe(true);
});

test('Given with `JsonRpcResponsePayload.error`, returns true', async () => {
  expect(isJsonRpcResponsePayload({ jsonrpc: '2.0', id: 1, error: { code: 1, message: 'hello' } } as any)).toBe(true);
});
