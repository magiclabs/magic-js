/* eslint-disable no-underscore-dangle */

import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDK } from '../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../lib/constants';
import { IframeController } from '../../../../src/core/iframe-controller';

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * `MagicSDK.overlay` is lazy loaded.
 *
 * Action Must:
 * - Not construct a `IframeController` instance until `overlay` is accessed.
 */
test('#01', async t => {
  const magic = new MagicSDK(TEST_API_KEY);

  t.is((MagicSDK as any).__overlays__.size, 0);

  const { overlay: A } = magic as any;
  const B = (MagicSDK as any).__overlays__.values().next().value;

  t.is((MagicSDK as any).__overlays__.size, 1);
  t.true(A instanceof IframeController);
  t.is(A, B);
});

/**
 * `MagicSDK.overlay` is shared between `MagicSDK` instances with same
 * parameters.
 *
 * Action Must:
 * - Use exact same `IframeController` between two equivalent `MagicSDK`
 *   instances.
 */
test('#02', async t => {
  const magicA = new MagicSDK(TEST_API_KEY);
  const magicB = new MagicSDK(TEST_API_KEY);

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  t.is(A, B);
});

/**
 * `MagicSDK.overlay` is unique between `MagicSDK` instances with different
 * parameters.
 *
 * Action Must:
 * - Use different `IframeController` instances between two different `MagicSDK`
 *   instances.
 */
test('#03', async t => {
  const magicA = new MagicSDK(TEST_API_KEY);
  const magicB = new MagicSDK('asdfasdf');

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  t.not(A, B);
});
