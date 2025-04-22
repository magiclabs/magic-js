import browserEnv from '@ikscodes/browser-env';
import { MagicExtensionError } from '../../../../../src/core/sdk-exceptions';
import { BaseExtension } from '../../../../../src/modules/base-extension';

beforeEach(() => {
  browserEnv();
});

class TestExtension extends BaseExtension<'test'> {
  name = 'test' as const;
}

test('Instantiate `MagicExtensionError`', () => {
  const ext = new TestExtension();
  const error = new MagicExtensionError(ext, 'TEST_CODE', 'test message', { hello: 'world' });

  expect(error instanceof MagicExtensionError).toBe(true);
  expect(error.message).toBe('Magic Extension Error (test): [TEST_CODE] test message');
  expect(error.rawMessage).toBe('test message');
  expect(error.code).toBe('TEST_CODE');
  expect(error.data).toEqual({ hello: 'world' });
});
