/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicExtensionWarning } from '../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../src/modules/base-extension';

test.beforeEach((t) => {
  browserEnv.restore();
});

test('Creates a `MagicExtensionWarning`', (t) => {
  const baseExtension = new (Extension as any)();

  const expectedWarning = new MagicExtensionWarning(baseExtension, 'TEST', 'hello world');
  const error: MagicExtensionWarning = baseExtension.createWarning('TEST', 'hello world');

  t.is(expectedWarning.code, error.code);
  t.is(expectedWarning.message, error.message);
});
