/* eslint-disable global-require */

import test, { ExecutionContext } from 'ava';
import importFresh from 'import-fresh';

function requireIndex() {
  return importFresh('../../src/index');
}

function assertGlobalPolyfill(t: ExecutionContext, globalKey: string) {
  delete global[globalKey];

  t.is(typeof global[globalKey], 'undefined');

  requireIndex();

  t.is(typeof global[globalKey], 'function');
}

test.serial('Defines global `btoa` function if none exists', t => {
  assertGlobalPolyfill(t, 'btoa');
});

test.serial('Defines global `atob` function if none exists', t => {
  assertGlobalPolyfill(t, 'atob');
});

// We can't effectively test the following without breaking Ava and TS Node.
// Unfortunately, we have to simply ignore these code paths.

// test.serial('Defines global `Buffer` constructor if none exists', t =>
// {assertGlobalPolyfill(t, 'Buffer');
// });

// test.serial('Defines global `URL` constructor if none exists', t => {
//   assertGlobalPolyfill(t, 'URL');
// });
