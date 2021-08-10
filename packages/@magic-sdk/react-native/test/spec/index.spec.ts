import * as _ from 'lodash';
import { requireIndex } from '../mocks';

function assertGlobalPolyfill(t: ExecutionContext, globalKey: string) {
  delete global[globalKey];

  expect(typeof global[globalKey]).toBe('undefined');

  requireIndex();

  expect(typeof global[globalKey]).toBe('function');
}

test('Defines global `btoa` function if none exists', () => {
  assertGlobalPolyfill(t, 'btoa');
});

test('Defines global `atob` function if none exists', () => {
  assertGlobalPolyfill(t, 'atob');
});

// It's impossible to cover process of undefined, as import requires process */
test('Defines global.process.version if none exists (Web3 case)', () => {
  // process.version is ready only, only checks the result
  requireIndex();
  expect(typeof global.process.version).toBe('string');
});

// We can't effectively test the following without breaking Ava and TS Node.
// Unfortunately, we have to simply ignore these code paths.

// test.serial('Defines global `Buffer` constructor if none exists', t =>
// {assertGlobalPolyfill(t, 'Buffer');
// });

// test.serial('Defines global `URL` constructor if none exists', t => {
//   assertGlobalPolyfill(t, 'URL');
// });
