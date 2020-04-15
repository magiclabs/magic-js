/* eslint-disable no-new */

import '../../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDK, MagicSDKReactNative } from '../../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../../lib/constants';
import { ReactNativeWebViewController } from '../../../../../src/core/views/react-native-webview-controller';

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * Initialize `MagicSDKReactNative`.
 *
 * Action Must:
 * - Initialize `MagicSDKReactNative` instance.
 * - Not throw.
 */
test.serial('#01', t => {
  const magic = new MagicSDKReactNative(TEST_API_KEY);

  t.true(magic instanceof MagicSDK);
  t.true((magic as any).overlay instanceof ReactNativeWebViewController);
});
