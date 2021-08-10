import browserEnv from '@ikscodes/browser-env';
import { createPromiEvent, isPromiEvent } from '../../../../src/util/promise-tools';

beforeEach(() => {
  browserEnv.restore();
});

test('Returns `true` for valid `PromiEvent` object', () => {
  const p = createPromiEvent((resolve) => resolve());

  expect(isPromiEvent(p)).toBe(true);
});

test('Returns `false` for invalid `PromiEvent` object', () => {
  const p = {};

  expect(isPromiEvent(p)).toBe(false);
});
