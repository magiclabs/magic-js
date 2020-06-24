import test from 'ava';
import { isJsonRpcRequestPayload } from '../../../../src/util/type-guards';

test('Given `undefined`, returns false', async (t) => {
  t.false(isJsonRpcRequestPayload(undefined));
});

test('Given `null`, returns false', async (t) => {
  t.false(isJsonRpcRequestPayload(null));
});

test('Given without `JsonRpcRequestPayload.jsonrpc`, returns false', async (t) => {
  t.false(isJsonRpcRequestPayload({ id: 1, params: [], method: '' } as any));
});

test('Given without `JsonRpcRequestPayload.id`, returns false', async (t) => {
  t.false(isJsonRpcRequestPayload({ jsonrpc: '2.0', params: [], method: '' } as any));
});

test('Given without `JsonRpcRequestPayload.params`, returns false', async (t) => {
  t.false(isJsonRpcRequestPayload({ jsonrpc: '2.0', id: 1, method: '' } as any));
});

test('Given without `JsonRpcRequestPayload.method`, returns false', async (t) => {
  t.false(isJsonRpcRequestPayload({ jsonrpc: '2.0', id: 1, params: [] } as any));
});

test('Given full `JsonRpcRequestPayload`, returns true', async (t) => {
  t.true(isJsonRpcRequestPayload({ jsonrpc: '2.0', id: 1, params: [], method: '' } as any));
});
