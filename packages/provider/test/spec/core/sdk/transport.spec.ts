/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { TEST_API_KEY } from '../../../constants';
import { PayloadTransport } from '../../../../src/core/payload-transport';
import { TestMagicSDK } from '../../../factories';
import { SDKBase } from '../../../../src/core/sdk';

test.beforeEach(t => {
  browserEnv.restore();
});

test('`MagicSDK.transport` is lazy loaded', async t => {
  const magic = new TestMagicSDK(TEST_API_KEY);

  t.is((SDKBase as any).__transports__.size, 0);

  const { transport: A } = magic as any;
  const B = (SDKBase as any).__transports__.values().next().value;

  t.is((SDKBase as any).__transports__.size, 1);
  t.true(A instanceof PayloadTransport);
  t.is(A, B);
});

test('`MagicSDK.transport` is shared between `MagicSDK` instances with same parameters', async t => {
  const magicA = new TestMagicSDK(TEST_API_KEY);
  const magicB = new TestMagicSDK(TEST_API_KEY);

  const { transport: A } = magicA as any;
  const { transport: B } = magicB as any;

  t.is(A, B);
});

test('`MagicSDK.transport` is unique between `MagicSDK` instances with different parameters', async t => {
  const magicA = new TestMagicSDK(TEST_API_KEY);
  const magicB = new TestMagicSDK('asdfasdf');

  const { transport: A } = magicA as any;
  const { transport: B } = magicB as any;

  t.not(A, B);
});
