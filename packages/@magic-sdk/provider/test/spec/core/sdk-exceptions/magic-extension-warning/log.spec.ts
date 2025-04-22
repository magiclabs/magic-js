import browserEnv from '@ikscodes/browser-env';
import { MagicExtensionWarning } from '../../../../../src/core/sdk-exceptions';
import { BaseExtension } from '../../../../../src/modules/base-extension';

class TestExtension extends BaseExtension<'test'> {
  name = 'test' as const;
}

test('`MagicSDKWarning.log` logs message to `console.warn`', async () => {
  const ext = new TestExtension();
  const warning = new MagicExtensionWarning(ext, 'TEST_CODE' as any, 'test message');
  const consoleWarningStub = jest.fn();
  browserEnv.stub('console.warn', consoleWarningStub);
  warning.log();

  expect(consoleWarningStub.mock.calls[0][0]).toBe('Magic Extension Warning (test): [TEST_CODE] test message');
});
