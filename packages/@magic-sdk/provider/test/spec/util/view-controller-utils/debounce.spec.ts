import { debounce } from '../../../../src/util/view-controller-utils';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('Debounced function clears previous timeout when called multiple times', () => {
  const func = jest.fn();
  const debouncedFunc = debounce(func, 100);

  // Call the debounced function multiple times
  debouncedFunc('first');
  jest.advanceTimersByTime(50);
  debouncedFunc('second');
  jest.advanceTimersByTime(50);
  debouncedFunc('third');

  // Function should not have been called yet
  expect(func).not.toHaveBeenCalled();

  // After the delay, only the last call should execute
  jest.advanceTimersByTime(100);
  expect(func).toHaveBeenCalledTimes(1);
  expect(func).toHaveBeenCalledWith('third');
});

test('Debounced function executes only once after delay when called multiple times', () => {
  const func = jest.fn();
  const debouncedFunc = debounce(func, 200);

  debouncedFunc('call1');
  jest.advanceTimersByTime(100);
  debouncedFunc('call2');
  jest.advanceTimersByTime(100);
  debouncedFunc('call3');
  jest.advanceTimersByTime(100);
  debouncedFunc('call4');

  // Function should not have been called yet
  expect(func).not.toHaveBeenCalled();

  // After the full delay from the last call, only the last call should execute
  jest.advanceTimersByTime(200);
  expect(func).toHaveBeenCalledTimes(1);
  expect(func).toHaveBeenCalledWith('call4');
});

test('Debounced function passes arguments correctly', () => {
  const func = jest.fn();
  const debouncedFunc = debounce(func, 100);

  debouncedFunc('arg1', 'arg2', 'arg3');
  jest.advanceTimersByTime(100);

  expect(func).toHaveBeenCalledTimes(1);
  expect(func).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
});
