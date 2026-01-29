import { debounce } from '../../../src/util/view-controller-utils';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('debounce calls the function after the delay', () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 100);

  debounced();
  expect(fn).not.toHaveBeenCalled();

  jest.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('debounce clears previous timeout when called multiple times quickly', () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 100);

  debounced();
  debounced();
  debounced();

  jest.advanceTimersByTime(100);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('debounce passes arguments to the function', () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 100);

  debounced('a', 'b');
  jest.advanceTimersByTime(100);

  expect(fn).toHaveBeenCalledWith('a', 'b');
});
