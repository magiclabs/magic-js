import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicExtensionWarning } from '../../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../../src/modules/base-extension';

test.beforeEach((t) => {
  browserEnv();
});

class TestExtension extends Extension<'test'> {
  name = 'test' as const;
}

test('Instantiate `MagicExtensionWarning`', (t) => {
  const ext = new TestExtension();
  const warning = new MagicExtensionWarning(ext, 'TEST_CODE' as any, 'test message');

  t.true(warning instanceof MagicExtensionWarning);
  t.is(warning.message, 'Magic Extension Warning (test): [TEST_CODE] test message');
  t.is(warning.rawMessage, 'test message');
  t.is(warning.code, 'TEST_CODE');
});
