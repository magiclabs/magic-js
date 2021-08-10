import browserEnv from '@ikscodes/browser-env';
import { MagicExtensionWarning } from '../../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../../src/modules/base-extension';

beforeEach(() => {
  browserEnv();
});

class TestExtension extends Extension<'test'> {
  name = 'test' as const;
}

test('Instantiate `MagicExtensionWarning`', () => {
  const ext = new TestExtension();
  const warning = new MagicExtensionWarning(ext, 'TEST_CODE' as any, 'test message');

  expect(warning instanceof MagicExtensionWarning).toBe(true);
  expect(warning.message).toBe('Magic Extension Warning (test): [TEST_CODE] test message');
  expect(warning.rawMessage).toBe('test message');
  expect(warning.code).toBe('TEST_CODE');
});
