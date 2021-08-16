import { isMagicPayloadMethod } from '../../../../src/util/type-guards';

test('Given `undefined`, returns false', async () => {
  expect(isMagicPayloadMethod(undefined)).toBe(false);
});

test('Given `null`, returns false', async () => {
  expect(isMagicPayloadMethod(null)).toBe(false);
});

test('Given without `MagicPayloadMethod`, returns false', async () => {
  expect(isMagicPayloadMethod('asdfasdf' as any)).toBe(false);
});

test('Given `MagicPayloadMethod`, returns true', async () => {
  expect(isMagicPayloadMethod('magic_auth_login_with_magic_link' as any)).toBe(true);
});
