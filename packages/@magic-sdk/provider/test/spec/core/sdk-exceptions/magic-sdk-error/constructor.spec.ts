import browserEnv from '@ikscodes/browser-env';
import { MagicSDKError } from '../../../../../src/core/sdk-exceptions';

beforeEach(() => {
  browserEnv();
});

test('Instantiate `MagicSDKError`', () => {
  const error = new MagicSDKError('TEST_CODE' as any, 'test message');

  expect(error instanceof MagicSDKError).toBe(true);
  expect(error.message).toBe('Magic SDK Error: [TEST_CODE] test message');
  expect(error.rawMessage).toBe('test message');
  expect(error.code).toBe('TEST_CODE');
});
