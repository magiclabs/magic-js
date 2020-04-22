/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDKReactNative } from '../../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../../constants';
import { mockConfigConstant, reactNativeStyleSheetStub } from '../../../../mocks';

test.beforeEach(t => {
  browserEnv.restore();
  mockConfigConstant('IS_REACT_NATIVE', true);
  reactNativeStyleSheetStub();
});

test('`MagicSDKReactNative.Relayer` returns `ReactNativeWebViewController.Relayer`', async t => {
  const magic = new MagicSDKReactNative(TEST_API_KEY);
  (magic as any).overlay.Relayer = 'hello world';
  t.is(magic.Relayer as any, 'hello world');
});
