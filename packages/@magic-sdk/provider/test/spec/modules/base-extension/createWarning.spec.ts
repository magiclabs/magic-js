import browserEnv from '@ikscodes/browser-env';
import { MagicExtensionWarning } from '../../../../src/core/sdk-exceptions';
import { ConcreteExtension } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Creates a `MagicExtensionWarning`', () => {
  const concreteExtension = new ConcreteExtension();

  const expectedWarning = new MagicExtensionWarning(concreteExtension, 'TEST', 'hello world');
  const error: MagicExtensionWarning = concreteExtension.testCreateWarning('TEST', 'hello world');

  expect(expectedWarning.code).toBe(error.code);
  expect(expectedWarning.message).toBe(error.message);
});
