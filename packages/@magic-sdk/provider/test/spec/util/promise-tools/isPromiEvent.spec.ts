import { createPromiEvent, isPromiEvent } from '../../../../src/util/promise-tools';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Returns `true` for valid `PromiEvent` object', () => {
  const promiEvent = createPromiEvent(resolve => resolve(true));

  expect(isPromiEvent(promiEvent)).toBe(true);
});

test('Returns `false` for invalid `PromiEvent` object', () => {
  const promiEvent = {};

  expect(isPromiEvent(promiEvent)).toBe(false);
});
