import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { createPromiEvent, isPromiEvent } from '../../../../src/util/promise-tools';

test.beforeEach(t => {
  browserEnv.restore();
});

test('Returns `true` for valid `PromiEvent` object', t => {
  const p = createPromiEvent(resolve => resolve());

  t.true(isPromiEvent(p));
});

test('Returns `false` for invalid `PromiEvent` object', t => {
  const p = {};

  t.false(isPromiEvent(p));
});
