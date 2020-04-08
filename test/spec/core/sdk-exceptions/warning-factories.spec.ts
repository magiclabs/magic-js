/* eslint-disable no-underscore-dangle */

import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test, { ExecutionContext } from 'ava';
import {
  MagicSDKWarning,
  createDuplicateIframeWarning,
  createSynchronousWeb3MethodWarning,
} from '../../../../src/core/sdk-exceptions';

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

/**
 * Creates a `SYNC_WEB3_METHOD` warning.
 *
 * Action Must:
 * - Create an instance of `MagicSDKWarning`
 * - Message and code should be the expected value for `SYNC_WEB3_METHOD`
 *   warning.
 */
test('#02 SYNC_WEB3_METHOD', async t => {
  const warning = createSynchronousWeb3MethodWarning();
  warningAssertions(
    t,
    warning,
    'SYNC_WEB3_METHOD',
    'Non-async web3 methods are deprecated in web3 > 1.0 and are not supported by the Magic web3 provider. Please use an async method instead.',
  );
});
