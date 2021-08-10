import test from 'ava';
import { isJsonRpcErrorCode } from '../../../../src/util/type-guards';

test('Given `undefined`, returns false', async (t) => {
  t.false(isJsonRpcErrorCode(undefined));
});

test('Given `null`, returns false', async (t) => {
  t.false(isJsonRpcErrorCode(null));
});

test('Given without `MagicRpcErrorCode`, returns false', async (t) => {
  t.false(isJsonRpcErrorCode('asdfasdf' as any));
});

test('Given with `MagicRpcErrorCode`, returns true', async (t) => {
  t.true(isJsonRpcErrorCode(-32603 as any));
});
