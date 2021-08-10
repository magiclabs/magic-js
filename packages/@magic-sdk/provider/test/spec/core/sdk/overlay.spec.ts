/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import { TEST_API_KEY } from '../../../constants';
import { ViewController } from '../../../../src/core/view-controller';
import { TestMagicSDK } from '../../../factories';
import { SDKBase } from '../../../../src/core/sdk';

beforeEach(() => {
  browserEnv.restore();
});

test('`MagicSDK.overlay` is lazy loaded', async () => {
  const magic = new TestMagicSDK(TEST_API_KEY);

  expect((SDKBase as any).__overlays__.size).toBe(0);

  const { overlay: A } = magic as any;
  const B = (SDKBase as any).__overlays__.values().next().value;

  expect((SDKBase as any).__overlays__.size).toBe(1);
  expect(A instanceof ViewController).toBe(true);
  expect(A).toBe(B);
});

test('`MagicSDK.overlay` is shared between `MagicSDK` instances with same parameters', async () => {
  const magicA = new TestMagicSDK(TEST_API_KEY);
  const magicB = new TestMagicSDK(TEST_API_KEY);

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  expect(A).toBe(B);
});

test('`MagicSDK.overlay` is unique between `MagicSDK` instances with different parameters', async () => {
  const magicA = new TestMagicSDK(TEST_API_KEY);
  const magicB = new TestMagicSDK('asdfasdf');

  const { overlay: A } = magicA as any;
  const { overlay: B } = magicB as any;

  expect(A).not.toBe(B);
});
