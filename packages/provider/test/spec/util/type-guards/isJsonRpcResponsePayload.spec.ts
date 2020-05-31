import test from 'ava';
import { isJsonRpcResponsePayload } from '../../../../src/util/type-guards';

test('Given `undefined`, returns false', async t => {
  t.false(isJsonRpcResponsePayload(undefined));
});

test('Given `null`, returns false', async t => {
  t.false(isJsonRpcResponsePayload(null));
});

test('Given without `JsonRpcResponsePayload.jsonrpc`, returns false', async t => {
  t.false(isJsonRpcResponsePayload({ id: 1, result: 'hello' } as any));
});

test('Given without `JsonRpcResponsePayload.id`, returns false', async t => {
  t.false(isJsonRpcResponsePayload({ jsonrpc: '2.0', result: 'hello' } as any));
});

test('Given without `JsonRpcResponsePayload.result`, returns false', async t => {
  t.false(isJsonRpcResponsePayload({ jsonrpc: '2.0', id: 1 } as any));
});

test('Given with `JsonRpcResponsePayload.result`, returns true', async t => {
  t.true(isJsonRpcResponsePayload({ jsonrpc: '2.0', id: 1, result: 'hello' } as any));
});

test('Given with `JsonRpcResponsePayload.error`, returns true', async t => {
  t.true(isJsonRpcResponsePayload({ jsonrpc: '2.0', id: 1, error: { code: 1, message: 'hello' } } as any));
});
