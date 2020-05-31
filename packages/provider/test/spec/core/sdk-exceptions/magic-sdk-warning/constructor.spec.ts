import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDKWarning } from '../../../../../src/core/sdk-exceptions';

test.beforeEach(t => {
  browserEnv();
});

test('Instantiate `MagicSDKWarning`', t => {
  const warning = new MagicSDKWarning('TEST_CODE' as any, 'test message');

  t.true(warning instanceof MagicSDKWarning);
  t.is(warning.message, 'Magic SDK Warning: [TEST_CODE] test message');
  t.is(warning.rawMessage, 'test message');
  t.is(warning.code, 'TEST_CODE');
});
