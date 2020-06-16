/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicExtensionError } from '../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../src/modules/base-extension';

test.beforeEach(t => {
  browserEnv.restore();
});

test('Throws a `MagicExtensionError`', t => {
  const baseExtension = new (Extension as any)();

  const expectedError = new MagicExtensionError(baseExtension, 'TEST', 'hello world');
  const error: MagicExtensionError = t.throws(() => baseExtension.raiseError('TEST', 'hello world'));

  t.is(expectedError.code, error.code);
  t.is(expectedError.message, error.message);
});
