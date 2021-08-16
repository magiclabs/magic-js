import { isEmpty } from '../../../../src/util/type-guards';

test('Given `undefined`, returns true', async () => {
  expect(isEmpty(undefined)).toBe(true);
});

test('Given `null`, returns true', async () => {
  expect(isEmpty(null)).toBe(true);
});

test('Given empty object, returns true', async () => {
  expect(isEmpty({})).toBe(true);
});

test('Given non-empty object, returns false', async () => {
  expect(isEmpty({ hello: 'world' })).toBe(false);
});
