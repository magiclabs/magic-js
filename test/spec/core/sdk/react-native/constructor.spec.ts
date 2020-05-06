/* eslint-disable no-new */

import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import test from 'ava';
import { MagicSDK, MagicSDKReactNative } from '../../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../../constants';
import { createReactNativeEndpointConfigurationWarning } from '../../../../../src/core/sdk-exceptions';
import { mockConfigConstant } from '../../../../mocks';

test.beforeEach(t => {
  browserEnv.restore();
});

test.serial('Initialize `MagicSDKReactNative`', t => {
  const magic = new MagicSDKReactNative(TEST_API_KEY);
  t.true(magic instanceof MagicSDKReactNative);
  t.true(magic instanceof MagicSDK);
});

test.serial('Warns upon construction of `MagicSDKReactNative` instance if `endpoint` parameter is provided.', t => {
  mockConfigConstant('IS_REACT_NATIVE', true);

  const consoleWarnStub = sinon.stub();
  browserEnv.stub('console.warn', consoleWarnStub);
  const expectedWarning = createReactNativeEndpointConfigurationWarning();

  new MagicSDKReactNative(TEST_API_KEY, { endpoint: 'https://example.com' } as any);

  t.true(consoleWarnStub.calledWith(expectedWarning.message));
});
