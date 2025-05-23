import { MagicSDKWarning } from '../../../../../src/core/sdk-exceptions';

test('`MagicSDKWarning.log` logs message to `console.warn`', async () => {
  const warning = new MagicSDKWarning('TEST_CODE' as any, 'test message');
  const consoleWarningStub = jest.fn();
  jest.spyOn(console, 'warn').mockImplementation(consoleWarningStub);
  warning.log();

  expect(consoleWarningStub.mock.calls[0][0]).toBe('Magic SDK Warning: [TEST_CODE] test message');
});
