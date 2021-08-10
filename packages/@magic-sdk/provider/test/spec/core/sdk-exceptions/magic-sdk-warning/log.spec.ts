import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { MagicSDKWarning } from '../../../../../src/core/sdk-exceptions';

test('`MagicSDKWarning.log` logs message to `console.warn`', async (t) => {
  const warning = new MagicSDKWarning('TEST_CODE' as any, 'test message');
  const consoleWarningStub = sinon.stub();
  browserEnv.stub('console.warn', consoleWarningStub);
  warning.log();

  t.is(consoleWarningStub.args[0][0], 'Magic SDK Warning: [TEST_CODE] test message');
});
