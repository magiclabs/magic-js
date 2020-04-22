/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { StyleSheet } from 'react-native';
import sinon from 'sinon';
import { MagicSDK, MagicSDKReactNative } from '../../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../../constants';
import { mockConfigConstant } from '../../../../mocks';
import { ReactNativeWebViewController } from '../../../../../src/core/views/react-native-webview-controller';

test.beforeEach(t => {
  browserEnv.restore();
  mockConfigConstant('IS_REACT_NATIVE', true);
  (StyleSheet as any) = { create: sinon.stub() };
});

test('`MagicSDKReactNative.overlay` is lazy loaded', async t => {
  const magic = new MagicSDKReactNative(TEST_API_KEY);

  t.is((MagicSDKReactNative as any).__overlays__.size, 0);

  const { overlay: A } = magic as any;
  const B = (MagicSDK as any).__overlays__.values().next().value;

  t.is((MagicSDK as any).__overlays__.size, 1);
  t.true(A instanceof ReactNativeWebViewController);
  t.is(A, B);
});

test('`MagicSDKReactNative.overlay` is shared between `MagicSDK` instances with same parameters', async t => {
  const magicA = new MagicSDKReactNative(TEST_API_KEY);
  const magicB = new MagicSDKReactNative(TEST_API_KEY);

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  t.is(A, B);
});

test('`MagicSDKReactNative.overlay` is unique between `MagicSDKReactNative` instances with different parameters', async t => {
  const magicA = new MagicSDKReactNative(TEST_API_KEY);
  const magicB = new MagicSDKReactNative('asdfasdf');

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  t.not(A, B);
});
