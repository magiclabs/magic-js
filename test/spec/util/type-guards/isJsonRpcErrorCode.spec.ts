import '../../../setup';

import test from 'ava';
import { isJsonRpcErrorCode } from '../../../../src/util/type-guards';

/**
 * Given `undefined`
 *
 * Action Must:
 * - Should return `false`
 */
test('#01', async t => {
  t.false(isJsonRpcErrorCode(undefined));
});

/**
 * Given `null`
 *
 * Action Must:
 * - Should return `false`
 */
test('#02', async t => {
  t.false(isJsonRpcErrorCode(null));
});

/**
 * Given without `MagicRpcErrorCode`
 *
 * Action Must:
 * - Should return `false`
 */
test('#03', async t => {
  t.false(isJsonRpcErrorCode('asdfasdf' as any));
});

/**
 * Given with `MagicRpcErrorCode`
 *
 * Action Must:
 * - Should return `true`
 */
test('#04', async t => {
  t.true(isJsonRpcErrorCode(-32603 as any));
});
