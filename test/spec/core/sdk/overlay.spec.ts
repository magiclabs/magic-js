/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDK } from '../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../constants';
import { IframeController } from '../../../../src/core/views/iframe-controller';

test.beforeEach(t => {
  browserEnv.restore();
});

test('`MagicSDK.overlay` is lazy loaded', async t => {
  const magic = new MagicSDK(TEST_API_KEY);

  t.is((MagicSDK as any).__overlays__.size, 0);

  const { overlay: A } = magic as any;
  const B = (MagicSDK as any).__overlays__.values().next().value;

  t.is((MagicSDK as any).__overlays__.size, 1);
  t.true(A instanceof IframeController);
  t.is(A, B);
});

test('`MagicSDK.overlay` is shared between `MagicSDK` instances with same parameters', async t => {
  const magicA = new MagicSDK(TEST_API_KEY);
  const magicB = new MagicSDK(TEST_API_KEY);

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  t.is(A, B);
});

test('`MagicSDK.overlay` is unique between `MagicSDK` instances with different parameters', async t => {
  const magicA = new MagicSDK(TEST_API_KEY);
  const magicB = new MagicSDK('asdfasdf');

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  t.not(A, B);
});
