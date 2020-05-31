/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { TEST_API_KEY } from '../../../constants';
import { ViewController } from '../../../../src/core/view-controller';
import { TestMagicSDK } from '../../../factories';
import { SDKBase } from '../../../../src/core/sdk';

test.beforeEach(t => {
  browserEnv.restore();
});

test('`MagicSDK.overlay` is lazy loaded', async t => {
  const magic = new TestMagicSDK(TEST_API_KEY);

  t.is((SDKBase as any).__overlays__.size, 0);

  const { overlay: A } = magic as any;
  const B = (SDKBase as any).__overlays__.values().next().value;

  t.is((SDKBase as any).__overlays__.size, 1);
  t.true(A instanceof ViewController);
  t.is(A, B);
});

test('`MagicSDK.overlay` is shared between `MagicSDK` instances with same parameters', async t => {
  const magicA = new TestMagicSDK(TEST_API_KEY);
  const magicB = new TestMagicSDK(TEST_API_KEY);

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  t.is(A, B);
});

test('`MagicSDK.overlay` is unique between `MagicSDK` instances with different parameters', async t => {
  const magicA = new TestMagicSDK(TEST_API_KEY);
  const magicB = new TestMagicSDK('asdfasdf');

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  t.not(A, B);
});
