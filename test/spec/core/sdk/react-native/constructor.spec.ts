/* eslint-disable no-new */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDK, MagicSDKReactNative } from '../../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../../constants';

test.beforeEach(t => {
  browserEnv.restore();
});

test.serial('Initialize `MagicSDKReactNative`', t => {
  const magic = new MagicSDKReactNative(TEST_API_KEY);
  t.true(magic instanceof MagicSDKReactNative);
  t.true(magic instanceof MagicSDK);
});
