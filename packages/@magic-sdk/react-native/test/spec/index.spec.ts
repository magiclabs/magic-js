import * as _ from 'lodash';
import test, { ExecutionContext } from 'ava';
import { requireIndex } from '../mocks';

function assertGlobalPolyfill(t: ExecutionContext, globalKey: string) {
  delete global[globalKey];

  t.is(typeof global[globalKey], 'undefined');

  requireIndex();

  t.is(typeof global[globalKey], 'function');
}

test.serial('Defines global `btoa` function if none exists', (t) => {
  assertGlobalPolyfill(t, 'btoa');
});

test.serial('Defines global `atob` function if none exists', (t) => {
  assertGlobalPolyfill(t, 'atob');
});

// It's impossible to cover process of undefined, as import requires process */
test('Defines global.process.version if none exists (Web3 case)', (t) => {
  // process.version is ready only, only checks the result
  requireIndex();
  t.is(typeof global.process.version, 'string');
});

// We can't effectively test the following without breaking Ava and TS Node.
// Unfortunately, we have to simply ignore these code paths.

// test.serial('Defines global `Buffer` constructor if none exists', t =>
// {assertGlobalPolyfill(t, 'Buffer');
// });

// test.serial('Defines global `URL` constructor if none exists', t => {
//   assertGlobalPolyfill(t, 'URL');
// });
