import * as _ from 'lodash';
import test, { ExecutionContext } from 'ava';
import { requireIndex } from '../mocks';

function assertGlobalPolyfill(t: ExecutionContext, globalKey: string, targetType: string) {
  _.set(global, globalKey, undefined);

  console.log('process', typeof global.process);

  t.is(typeof _.get(global, globalKey), 'undefined');

  requireIndex();

  t.is(typeof _.get(global, globalKey), targetType);
}

test.serial('Defines global `btoa` function if none exists', (t) => {
  assertGlobalPolyfill(t, 'btoa', 'function');
});

test.serial('Defines global `atob` function if none exists', (t) => {
  assertGlobalPolyfill(t, 'atob', 'function');
});

test.serial('Defines global.process if none exists', (t) => {
  assertGlobalPolyfill(t, 'process', 'object');
});

test.serial('Defines global.process.version if none exists (Web3 case)', (t) => {
  assertGlobalPolyfill(t, 'process.version', 'string');
});

// We can't effectively test the following without breaking Ava and TS Node.
// Unfortunately, we have to simply ignore these code paths.

// test.serial('Defines global `Buffer` constructor if none exists', t =>
// {assertGlobalPolyfill(t, 'Buffer');
// });

// test.serial('Defines global `URL` constructor if none exists', t => {
//   assertGlobalPolyfill(t, 'URL');
// });
