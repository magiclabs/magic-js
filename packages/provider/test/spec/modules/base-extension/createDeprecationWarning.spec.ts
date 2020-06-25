/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicExtensionWarning } from '../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../src/modules/base-extension';

test.beforeEach((t) => {
  browserEnv.restore();
});

test('Creates a `DEPRECATION_NOTICE` warning without `useInstead` suffix', async (t) => {
  const baseExtension = new (Extension as any)();

  const expectedWarning = new MagicExtensionWarning(
    baseExtension,
    'DEPRECATION_NOTICE',
    '`test()` will be removed from this Extension in version `v999`.',
  );

  const error: MagicExtensionWarning = baseExtension.createDeprecationWarning({
    method: 'test()',
    removalVersion: 'v999',
  });

  t.is(expectedWarning.code, error.code);
  t.is(expectedWarning.message, error.message);
});

test('Creates a `DEPRECATION_NOTICE` warning with `useInstead` suffix', async (t) => {
  const baseExtension = new (Extension as any)();

  const expectedWarning = new MagicExtensionWarning(
    baseExtension,
    'DEPRECATION_NOTICE',
    '`test()` will be removed from this Extension in version `v999`. Use `test2()` instead.',
  );

  const error: MagicExtensionWarning = baseExtension.createDeprecationWarning({
    method: 'test()',
    removalVersion: 'v999',
    useInstead: 'test2()',
  });

  t.is(expectedWarning.code, error.code);
  t.is(expectedWarning.message, error.message);
});
