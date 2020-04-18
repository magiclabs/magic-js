/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDK } from '../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../constants';
import { PayloadTransport } from '../../../../src/core/payload-transport';

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * `MagicSDK.transport` is lazy loaded.
 *
 * Action Must:
 * - Not construct a `ProviderTransport` instance until `transport` is accessed.
 */
test('#01', async t => {
  const magic = new MagicSDK(TEST_API_KEY);

  t.is((MagicSDK as any).__transports__.size, 0);

  const { transport: A } = magic as any;
  const B = (MagicSDK as any).__transports__.values().next().value;

  t.is((MagicSDK as any).__transports__.size, 1);
  t.true(A instanceof PayloadTransport);
  t.is(A, B);
});

/**
 * `MagicSDK.transport` is shared between `MagicSDK` instances with same
 * parameters.
 *
 * Action Must:
 * - Use exact same `PayloadTransport` between two equivalent `MagicSDK`
 *   instances.
 */
test('#02', async t => {
  const magicA = new MagicSDK(TEST_API_KEY);
  const magicB = new MagicSDK(TEST_API_KEY);

  const { transport: A } = magicA as any;
  const { transport: B } = magicB as any;

  t.is(A, B);
});

/**
 * `MagicSDK.transport` is unique between `MagicSDK` instances with different
 * parameters.
 *
 * Action Must:
 * - Use different `PayloadTransport` instances between two different `MagicSDK`
 *   instances.
 */
test('#03', async t => {
  const magicA = new MagicSDK(TEST_API_KEY);
  const magicB = new MagicSDK('asdfasdf');

  const { transport: A } = magicA as any;
  const { transport: B } = magicB as any;

  t.not(A, B);
});
