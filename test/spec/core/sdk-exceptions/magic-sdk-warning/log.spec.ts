import '../../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { MagicSDKWarning } from '../../../../../src/core/sdk-exceptions';

/**
 * `MagicSDKWarning.log` logs message to `console.warn`
 *
 * Action Must:
 * - Create an instance of `MagicSDKWarning`
 * - Call `MagicSDKWarning.log`
 * - Logs `MagicSDKWarning.message` to `console.warn`
 */
test('#01', async t => {
  const warning = new MagicSDKWarning('TEST_CODE' as any, 'test message');
  const consoleWarningStub = sinon.stub();
  browserEnv.stub('console.warn', consoleWarningStub);
  warning.log();

  t.is(consoleWarningStub.args[0][0], 'Magic SDK Warning: [TEST_CODE] test message');
});
