/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import { TEST_API_KEY } from '../../../constants';
import { PayloadTransport } from '../../../../src/core/payload-transport';
import { createMagicSDKCtor } from '../../../factories';
import { SDKBase } from '../../../../src/core/sdk';

beforeEach(() => {
  browserEnv.restore();
});

test('`MagicSDK.transport` is lazy loaded', async () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY);

  expect((SDKBase as any).__transports__.size).toBe(0);

  const { transport: A } = magic;
  const B = (SDKBase as any).__transports__.values().next().value;

  expect((SDKBase as any).__transports__.size).toBe(1);
  expect(A instanceof PayloadTransport).toBe(true);
  expect(A).toBe(B);
});

test('`MagicSDK.transport` is shared between `MagicSDK` instances with same parameters', async () => {
  const Ctor = createMagicSDKCtor();
  const magicA = new Ctor(TEST_API_KEY);
  const magicB = new Ctor(TEST_API_KEY);

  const { transport: A } = magicA;
  const { transport: B } = magicB;

  expect(A).toBe(B);
});

test('`MagicSDK.transport` is unique between `MagicSDK` instances with different parameters', async () => {
  const Ctor = createMagicSDKCtor();
  const magicA = new Ctor(TEST_API_KEY);
  const magicB = new Ctor('asdfasdf');

  const { transport: A } = magicA;
  const { transport: B } = magicB;

  expect(A).not.toBe(B);
});
