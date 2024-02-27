/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import browserEnv from '@ikscodes/browser-env';
import { mockSDKEnvironmentConstant, restoreSDKEnvironmentConstants } from '../../../mocks';

function warningAssertions(warning: any, expectedCode: string, expectedMessage: string) {
  const { MagicSDKWarning } = require('../../../../src/core/sdk-exceptions');
  expect(warning instanceof MagicSDKWarning).toBe(true);
  expect(warning.code).toBe(expectedCode);
  expect(warning.message).toBe(`Magic SDK Warning: [${expectedCode}] ${expectedMessage}`);
  expect(warning.rawMessage).toBe(expectedMessage);
}

beforeEach(() => {
  jest.resetModules();
  browserEnv.restore();
  restoreSDKEnvironmentConstants();
});

test('Creates a `DUPLICATE_IFRAME` warning', async () => {
  const { createDuplicateIframeWarning } = require('../../../../src/core/sdk-exceptions');
  const warning = createDuplicateIframeWarning();
  warningAssertions(warning, 'DUPLICATE_IFRAME', 'Duplicate iframes found.');
});

test('Creates a `SYNC_WEB3_METHOD` warning', async () => {
  const { createSynchronousWeb3MethodWarning } = require('../../../../src/core/sdk-exceptions');
  const warning = createSynchronousWeb3MethodWarning();
  warningAssertions(
    warning,
    'SYNC_WEB3_METHOD',
    'Non-async web3 methods are deprecated in web3 > 1.0 and are not supported by the Magic web3 provider. Please use an async method instead.',
  );
});

test('Creates a `REACT_NATIVE_ENDPOINT_CONFIGURATION` warning', async () => {
  mockSDKEnvironmentConstant({ defaultEndpoint: 'https://example.com' });

  const { createReactNativeEndpointConfigurationWarning } = require('../../../../src/core/sdk-exceptions');
  const warning = createReactNativeEndpointConfigurationWarning();
  warningAssertions(
    warning,
    'REACT_NATIVE_ENDPOINT_CONFIGURATION',
    'CUSTOM DOMAINS ARE NOT SUPPORTED WHEN USING MAGIC SDK WITH REACT NATIVE! The `endpoint` parameter SHOULD NOT be provided. The Magic `<iframe>` is automatically wrapped by a WebView pointed at `https://example.com`. Changing this default behavior will lead to unexpected results and potentially security-threatening bugs.',
  );
});

test('Creates a `DEPRECATION_NOTICE` warning for `magic-sdk`', async () => {
  mockSDKEnvironmentConstant({ sdkName: 'magic-sdk' });

  const { createDeprecationWarning } = require('../../../../src/core/sdk-exceptions');
  const warning = createDeprecationWarning({
    method: 'test()',
    removalVersions: {
      'magic-sdk': 'v999',
      '@magic-sdk/react-native-bare': 'v888',
      '@magic-sdk/react-native-expo': 'v777',
    },
  });

  warningAssertions(warning, 'DEPRECATION_NOTICE', '`test()` will be removed from `magic-sdk` in version `v999`.');
});

test('Creates a `DEPRECATION_NOTICE` warning for `@magic-sdk/react-native-bare`', async () => {
  mockSDKEnvironmentConstant({ sdkName: '@magic-sdk/react-native-bare' });

  const { createDeprecationWarning } = require('../../../../src/core/sdk-exceptions');
  const warning = createDeprecationWarning({
    method: 'test()',
    removalVersions: {
      'magic-sdk': 'v999',
      '@magic-sdk/react-native-bare': 'v888',
      '@magic-sdk/react-native-expo': 'v777',
    },
  });

  warningAssertions(
    warning,
    'DEPRECATION_NOTICE',
    '`test()` will be removed from `@magic-sdk/react-native-bare` in version `v888`.',
  );
});

test('Creates a `DEPRECATION_NOTICE` warning for `@magic-sdk/react-native-expo`', async () => {
  mockSDKEnvironmentConstant({ sdkName: '@magic-sdk/react-native-expo' });

  const { createDeprecationWarning } = require('../../../../src/core/sdk-exceptions');
  const warning = createDeprecationWarning({
    method: 'test()',
    removalVersions: { 'magic-sdk': 'v999', '@magic-sdk/react-native': 'v888', '@magic-sdk/react-native-expo': 'v777' },
  });

  warningAssertions(
    warning,
    'DEPRECATION_NOTICE',
    '`test()` will be removed from `@magic-sdk/react-native-expo` in version `v777`.',
  );
});

test('Creates a `DEPRECATION_NOTICE` warning with `useInstead` suffix', async () => {
  mockSDKEnvironmentConstant({ sdkName: 'magic-sdk' });

  const { createDeprecationWarning } = require('../../../../src/core/sdk-exceptions');
  const warning = createDeprecationWarning({
    method: 'test()',
    removalVersions: {
      'magic-sdk': 'v999',
      '@magic-sdk/react-native-bare': 'v888',
      '@magic-sdk/react-native-expo': 'v777',
    },
    useInstead: 'test2()',
  });

  warningAssertions(
    warning,
    'DEPRECATION_NOTICE',
    '`test()` will be removed from `magic-sdk` in version `v999`. Use `test2()` instead.',
  );
});
