import { MagicExtensionError } from '../../../../src/core/sdk-exceptions';
import { BaseExtension, Extension } from '../../../../src/modules/base-extension';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Creates a `MagicExtensionError`', () => {
  // @ts-ignore
  const baseExtension = new BaseExtension();

  const expectedError = new MagicExtensionError(baseExtension, 'TEST', 'hello world', {});
  const error: MagicExtensionError = baseExtension.createError('TEST', 'hello world');

  expect(expectedError.code).toBe(error.code);
  expect(expectedError.message).toBe(error.message);
});
