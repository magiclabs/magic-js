import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { MagicExtensionWarning } from '../../../../../src/core/sdk-exceptions';
import { Extension } from '../../../../../src/modules/base-extension';

class TestExtension extends Extension<'test'> {
  name = 'test' as const;
}

test('`MagicSDKWarning.log` logs message to `console.warn`', async (t) => {
  const ext = new TestExtension();
  const warning = new MagicExtensionWarning(ext, 'TEST_CODE' as any, 'test message');
  const consoleWarningStub = sinon.stub();
  browserEnv.stub('console.warn', consoleWarningStub);
  warning.log();

  t.is(consoleWarningStub.args[0][0], 'Magic Extension Error (test): [TEST_CODE] test message');
});
