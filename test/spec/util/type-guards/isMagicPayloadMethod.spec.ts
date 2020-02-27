import '../../../setup';

import test from 'ava';
import { isMagicPayloadMethod } from '../../../../src/util/type-guards';

/**
 * Given `undefined`
 *
 * Action Must:
 * - Should return `false`
 */
test('#01', async t => {
  t.false(isMagicPayloadMethod(undefined));
});

/**
 * Given `null`
 *
 * Action Must:
 * - Should return `false`
 */
test('#02', async t => {
  t.false(isMagicPayloadMethod(null));
});

/**
 * Given without `MagicPayloadMethod`
 *
 * Action Must:
 * - Should return `false`
 */
test('#03', async t => {
  t.false(isMagicPayloadMethod('asdfasdf' as any));
});

/**
 * Given with `MagicPayloadMethod`
 *
 * Action Must:
 * - Should return `true`
 */
test('#04', async t => {
  t.true(isMagicPayloadMethod('magic_auth_login_with_magic_link' as any));
});
