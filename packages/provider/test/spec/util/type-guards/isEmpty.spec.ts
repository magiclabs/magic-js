import test from 'ava';
import { isEmpty } from '../../../../src/util/type-guards';

test('Given `undefined`, returns true', async (t) => {
  t.true(isEmpty(undefined));
});

test('Given `null`, returns true', async (t) => {
  t.true(isEmpty(null));
});

test('Given empty object, returns true', async (t) => {
  t.true(isEmpty({}));
});

test('Given non-empty object, returns false', async (t) => {
  t.false(isEmpty({ hello: 'world' }));
});
