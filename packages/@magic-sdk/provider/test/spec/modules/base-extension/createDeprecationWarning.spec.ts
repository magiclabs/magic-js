import browserEnv from '@ikscodes/browser-env';
import { MagicExtensionWarning } from '../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../src/modules/base-extension';

beforeEach(() => {
  browserEnv.restore();
});

test('Creates a `DEPRECATION_NOTICE` warning without `useInstead` suffix', async () => {
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

  expect(expectedWarning.code).toBe(error.code);
  expect(expectedWarning.message).toBe(error.message);
});

test('Creates a `DEPRECATION_NOTICE` warning with `useInstead` suffix', async () => {
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

  expect(expectedWarning.code).toBe(error.code);
  expect(expectedWarning.message).toBe(error.message);
});
