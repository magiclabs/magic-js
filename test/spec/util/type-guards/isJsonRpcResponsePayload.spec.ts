import test from 'ava';
import { isJsonRpcResponsePayload } from '../../../../src/util/type-guards';

/**
 * Given `undefined`
 *
 * Action Must:
 * - Should return `false`
 */
test('#01', async t => {
  t.false(isJsonRpcResponsePayload(undefined));
});

/**
 * Given `null`
 *
 * Action Must:
 * - Should return `false`
 */
test('#02', async t => {
  t.false(isJsonRpcResponsePayload(null));
});

/**
 * Given without `JsonRpcResponsePayload.jsonrpc`
 *
 * Action Must:
 * - Should return `false`
 */
test('#03', async t => {
  t.false(isJsonRpcResponsePayload({ id: 1, result: 'hello' } as any));
});

/**
 * Given without `JsonRpcResponsePayload.id`
 *
 * Action Must:
 * - Should return `false`
 */
test('#04', async t => {
  t.false(isJsonRpcResponsePayload({ jsonrpc: '2.0', result: 'hello' } as any));
});

/**
 * Given without `JsonRpcResponsePayload.result` or
 * `JsonRpcResponsePayload.error`
 *
 * Action Must:
 * - Should return `false`
 */
test('#05', async t => {
  t.false(isJsonRpcResponsePayload({ jsonrpc: '2.0', id: 1 } as any));
});

/**
 * Given with `JsonRpcResponsePayload.result`
 *
 * Action Must:
 * - Should return `true`
 */
test('#06', async t => {
  t.true(isJsonRpcResponsePayload({ jsonrpc: '2.0', id: 1, result: 'hello' } as any));
});

/**
 * Given with `JsonRpcResponsePayload.error`
 *
 * Action Must:
 * - Should return `true`
 */
test('#07', async t => {
  t.true(isJsonRpcResponsePayload({ jsonrpc: '2.0', id: 1, error: { code: 1, message: 'hello' } } as any));
});
