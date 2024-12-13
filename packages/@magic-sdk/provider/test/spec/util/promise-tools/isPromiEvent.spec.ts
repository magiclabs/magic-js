import { createPromiEvent, isPromiEvent } from '../../../../src/util/promise-tools';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Returns `true` for valid `PromiEvent` object', () => {
  const p = createPromiEvent(resolve => resolve(true));

  expect(isPromiEvent(p)).toBe(true);
});

test('Returns `false` for invalid `PromiEvent` object', () => {
  const p = {};

  expect(isPromiEvent(p)).toBe(false);
});
