import { isJsonRpcErrorCode } from '../../../../src/util/type-guards';

test('Given `undefined`, returns false', async () => {
  expect(isJsonRpcErrorCode(undefined)).toBe(false);
});

test('Given `null`, returns false', async () => {
  expect(isJsonRpcErrorCode(null)).toBe(false);
});

test('Given without `MagicRpcErrorCode`, returns false', async () => {
  expect(isJsonRpcErrorCode('asdfasdf' as any)).toBe(false);
});

test('Given with `MagicRpcErrorCode`, returns true', async () => {
  expect(isJsonRpcErrorCode(-32603 as any)).toBe(true);
});
