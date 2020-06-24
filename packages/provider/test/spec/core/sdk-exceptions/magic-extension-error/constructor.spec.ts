import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicExtensionError } from '../../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../../src/modules/base-extension';

test.beforeEach((t) => {
  browserEnv();
});

class TestExtension extends Extension<'test'> {
  name = 'test' as const;
}

test('Instantiate `MagicExtensionError`', (t) => {
  const ext = new TestExtension();
  const error = new MagicExtensionError(ext, 'TEST_CODE', 'test message');

  t.true(error instanceof MagicExtensionError);
  t.is(error.message, 'Magic Extension Error (test): [TEST_CODE] test message');
  t.is(error.rawMessage, 'test message');
  t.is(error.code, 'TEST_CODE');
});
