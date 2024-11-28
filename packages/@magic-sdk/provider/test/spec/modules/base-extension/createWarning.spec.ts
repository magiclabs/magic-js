import { MagicExtensionWarning } from '../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../src/modules/base-extension';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Creates a `MagicExtensionWarning`', () => {
  const baseExtension = new (Extension as any)();

  const expectedWarning = new MagicExtensionWarning(baseExtension, 'TEST', 'hello world');
  const error: MagicExtensionWarning = baseExtension.createWarning('TEST', 'hello world');

  expect(expectedWarning.code).toBe(error.code);
  expect(expectedWarning.message).toBe(error.message);
});
