/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import {
  MagicSDKWarning,
  createDuplicateIframeWarning,
  createSynchronousWeb3MethodWarning,
  createReactNativeEndpointConfigurationWarning,
  createDeprecationWarning,
} from '../../../../src/core/sdk-exceptions';
import { mockSDKEnvironmentConstant } from '../../../mocks';

function warningAssertions<T extends ExecutionContext<any>>(
  t: T,
  warning: MagicSDKWarning,
  expectedCode: string,
  expectedMessage: string,
) {
  expect(warning instanceof MagicSDKWarning).toBe(true);
  expect(warning.code).toBe(expectedCode);
  expect(warning.message).toBe(`Magic SDK Warning: [${expectedCode}] ${expectedMessage}`);
  expect(warning.rawMessage).toBe(expectedMessage);
}

beforeEach(() => {
  browserEnv.restore();
});

test('Creates a `DUPLICATE_IFRAME` warning', async () => {
  const warning = createDuplicateIframeWarning();
  warningAssertions(t, warning, 'DUPLICATE_IFRAME', 'Duplicate iframes found.');
});

test('Creates a `SYNC_WEB3_METHOD` warning', async () => {
  const warning = createSynchronousWeb3MethodWarning();
  warningAssertions(
    t,
    warning,
    'SYNC_WEB3_METHOD',
    'Non-async web3 methods are deprecated in web3 > 1.0 and are not supported by the Magic web3 provider. Please use an async method instead.',
  );
});

test('Creates a `REACT_NATIVE_ENDPOINT_CONFIGURATION` warning', async () => {
  mockSDKEnvironmentConstant('defaultEndpoint', 'https://example.com');

  const warning = createReactNativeEndpointConfigurationWarning();
  warningAssertions(
    t,
    warning,
    'REACT_NATIVE_ENDPOINT_CONFIGURATION',
    'CUSTOM DOMAINS ARE NOT SUPPORTED WHEN USING MAGIC SDK WITH REACT NATIVE! The `endpoint` parameter SHOULD NOT be provided. The Magic `<iframe>` is automatically wrapped by a WebView pointed at `https://example.com`. Changing this default behavior will lead to unexpected results and potentially security-threatening bugs.',
  );
});

test('Creates a `DEPRECATION_NOTICE` warning for `magic-sdk`', async () => {
  mockSDKEnvironmentConstant('sdkName', 'magic-sdk');

  const warning = createDeprecationWarning({
    method: 'test()',
    removalVersions: { 'magic-sdk': 'v999', '@magic-sdk/react-native': 'v888' },
  });

  warningAssertions(t, warning, 'DEPRECATION_NOTICE', '`test()` will be removed from `magic-sdk` in version `v999`.');
});

test('Creates a `DEPRECATION_NOTICE` warning for `@magic-sdk/react-native`', async () => {
  mockSDKEnvironmentConstant('sdkName', '@magic-sdk/react-native');

  const warning = createDeprecationWarning({
    method: 'test()',
    removalVersions: { 'magic-sdk': 'v999', '@magic-sdk/react-native': 'v888' },
  });

  warningAssertions(
    t,
    warning,
    'DEPRECATION_NOTICE',
    '`test()` will be removed from `@magic-sdk/react-native` in version `v888`.',
  );
});

test('Creates a `DEPRECATION_NOTICE` warning with `useInstead` suffix', async () => {
  mockSDKEnvironmentConstant('sdkName', 'magic-sdk');

  const warning = createDeprecationWarning({
    method: 'test()',
    removalVersions: { 'magic-sdk': 'v999', '@magic-sdk/react-native': 'v888' },
    useInstead: 'test2()',
  });

  warningAssertions(
    t,
    warning,
    'DEPRECATION_NOTICE',
    '`test()` will be removed from `magic-sdk` in version `v999`. Use `test2()` instead.',
  );
});
