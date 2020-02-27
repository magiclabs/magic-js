/* eslint-disable no-underscore-dangle */

import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test, { ExecutionContext } from 'ava';
import { MagicSDKWarning, createDuplicateIframeWarning } from '../../../../src/core/sdk-exceptions';

function warningAssertions<T extends ExecutionContext<any>>(
  t: T,
  warning: MagicSDKWarning,
  expectedCode: string,
  expectedMessage: string,
) {
  t.true(warning instanceof MagicSDKWarning);
  t.is(warning.code, expectedCode);
  t.is(warning.message, `Magic SDK Warning: [${expectedCode}] ${expectedMessage}`);
}

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * Creates a `DUPLICATE_IFRAME` warning.
 *
 * Action Must:
 * - Create an instance of `MagicSDKWarning`
 * - Message and code should be the expected value for `DUPLICATE_IFRAME`
 *   warning.
 */
test('#01 DUPLICATE_IFRAME', async t => {
  const warning = createDuplicateIframeWarning();
  warningAssertions(t, warning, 'DUPLICATE_IFRAME', 'Duplicate iframes found.');
});
