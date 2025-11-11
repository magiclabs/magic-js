import { MagicExtensionWarning } from '../../../../src/core/sdk-exceptions';
import { BaseExtension, Extension } from '../../../../src/modules/base-extension';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Creates a `DEPRECATION_NOTICE` warning without `useInstead` suffix', async () => {
  // @ts-ignore
  const baseExtension = new BaseExtension();

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
  // @ts-ignore
  const baseExtension = new BaseExtension();

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
