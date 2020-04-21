/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { MagicSDK } from '../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../constants';
import { PayloadTransport } from '../../../../src/core/payload-transport';

test.beforeEach(t => {
  browserEnv.restore();
});

test('`MagicSDK.transport` is lazy loaded', async t => {
  const magic = new MagicSDK(TEST_API_KEY);

  t.is((MagicSDK as any).__transports__.size, 0);

  const { transport: A } = magic as any;
  const B = (MagicSDK as any).__transports__.values().next().value;

  t.is((MagicSDK as any).__transports__.size, 1);
  t.true(A instanceof PayloadTransport);
  t.is(A, B);
});

test('`MagicSDK.transport` is shared between `MagicSDK` instances with same parameters', async t => {
  const magicA = new MagicSDK(TEST_API_KEY);
  const magicB = new MagicSDK(TEST_API_KEY);

  const { transport: A } = magicA as any;
  const { transport: B } = magicB as any;

  t.is(A, B);
});

test('`MagicSDK.transport` is unique between `MagicSDK` instances with different parameters', async t => {
  const magicA = new MagicSDK(TEST_API_KEY);
  const magicB = new MagicSDK('asdfasdf');

  const { transport: A } = magicA as any;
  const { transport: B } = magicB as any;

  t.not(A, B);
});
