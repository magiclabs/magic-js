import test from 'ava';
import { isMagicPayloadMethod } from '../../../../src/util/type-guards';

test('Given `undefined`, returns false', async (t) => {
  t.false(isMagicPayloadMethod(undefined));
});

test('Given `null`, returns false', async (t) => {
  t.false(isMagicPayloadMethod(null));
});

test('Given without `MagicPayloadMethod`, returns false', async (t) => {
  t.false(isMagicPayloadMethod('asdfasdf' as any));
});

test('Given `MagicPayloadMethod`, returns true', async (t) => {
  t.true(isMagicPayloadMethod('magic_auth_login_with_magic_link' as any));
});
