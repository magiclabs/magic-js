import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDKError } from '../../../../../src/core/sdk-exceptions';

test.beforeEach(t => {
  browserEnv();
});

/**
 * Instantiate `MagicSDKError`
 *
 * Action Must:
 * - Build instance
 * - Not throw
 */
test('#01', t => {
  const error = new MagicSDKError('TEST_CODE' as any, 'test message');

  t.true(error instanceof MagicSDKError);
  t.is(error.message, 'Magic SDK Error: [TEST_CODE] test message');
  t.is(error.rawMessage, 'test message');
  t.is(error.code, 'TEST_CODE');
});
