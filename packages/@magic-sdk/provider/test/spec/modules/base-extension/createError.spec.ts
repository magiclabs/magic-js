import browserEnv from '@ikscodes/browser-env';
import { MagicExtensionError } from '../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../src/modules/base-extension';

beforeEach(() => {
  browserEnv.restore();
});

test('Creates a `MagicExtensionError`', () => {
  const baseExtension = new (Extension as any)();

  const expectedError = new MagicExtensionError(baseExtension, 'TEST', 'hello world', {});
  const error: MagicExtensionError = baseExtension.createError('TEST', 'hello world');

  expect(expectedError.code).toBe(error.code);
  expect(expectedError.message).toBe(error.message);
});
