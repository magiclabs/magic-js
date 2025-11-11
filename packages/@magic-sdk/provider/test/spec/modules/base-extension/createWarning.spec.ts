import { MagicExtensionWarning } from '../../../../src/core/sdk-exceptions';
import { ConcreteExtension } from '../../../factories';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Creates a `MagicExtensionWarning`', () => {
  const concreteExtension = new ConcreteExtension();

  const expectedWarning = new MagicExtensionWarning(concreteExtension, 'TEST', 'hello world');
  const error: MagicExtensionWarning = concreteExtension.testCreateWarning('TEST', 'hello world');

  expect(expectedWarning.code).toBe(error.code);
  expect(expectedWarning.message).toBe(error.message);
});
