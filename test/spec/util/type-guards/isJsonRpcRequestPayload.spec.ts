import '../../../setup';

import test from 'ava';
import { isJsonRpcRequestPayload } from '../../../../src/util/type-guards';

/**
 * Given `undefined`
 *
 * Action Must:
 * - Should return `false`
 */
test('#01', async t => {
  t.false(isJsonRpcRequestPayload(undefined));
});

/**
 * Given `null`
 *
 * Action Must:
 * - Should return `false`
 */
test('#02', async t => {
  t.false(isJsonRpcRequestPayload(null));
});

/**
 * Given without `JsonRpcRequestPayload.jsonrpc`
 *
 * Action Must:
 * - Should return `false`
 */
test('#03', async t => {
  t.false(isJsonRpcRequestPayload({ id: 1, params: [], method: '' } as any));
});

/**
 * Given without `JsonRpcRequestPayload.id`
 *
 * Action Must:
 * - Should return `false`
 */
test('#04', async t => {
  t.false(isJsonRpcRequestPayload({ jsonrpc: '2.0', params: [], method: '' } as any));
});

/**
 * Given without `JsonRpcRequestPayload.params`
 *
 * Action Must:
 * - Should return `false`
 */
test('#05', async t => {
  t.false(isJsonRpcRequestPayload({ jsonrpc: '2.0', id: 1, method: '' } as any));
});

/**
 * Given without `JsonRpcRequestPayload.method`
 *
 * Action Must:
 * - Should return `false`
 */
test('#06', async t => {
  t.false(isJsonRpcRequestPayload({ jsonrpc: '2.0', id: 1, params: [] } as any));
});

/**
 * Given `JsonRpcRequestPayload`
 *
 * Action Must:
 * - Should return `true`
 */
test('#07', async t => {
  t.true(isJsonRpcRequestPayload({ jsonrpc: '2.0', id: 1, params: [], method: '' } as any));
});
