import browserEnv from '@ikscodes/browser-env';
import { MagicSDKWarning } from '../../../../../src/core/sdk-exceptions';

beforeEach(() => {
  browserEnv();
});

test('Instantiate `MagicSDKWarning`', () => {
  const warning = new MagicSDKWarning('TEST_CODE' as any, 'test message');

  expect(warning instanceof MagicSDKWarning).toBe(true);
  expect(warning.message).toBe('Magic SDK Warning: [TEST_CODE] test message');
  expect(warning.rawMessage).toBe('test message');
  expect(warning.code).toBe('TEST_CODE');
});
