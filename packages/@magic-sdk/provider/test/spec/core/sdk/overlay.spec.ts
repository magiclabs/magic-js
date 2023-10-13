import browserEnv from '@ikscodes/browser-env';
import { TEST_API_KEY } from '../../../constants';
import { ViewController } from '../../../../src/core/view-controller';
import { createMagicSDKCtor } from '../../../factories';
import { SDKBase } from '../../../../src/core/sdk';

beforeEach(() => {
  browserEnv.restore();
});

test('`MagicSDK.overlay` is lazy loaded', async () => {
  const Ctor = createMagicSDKCtor();
  const magic = new Ctor(TEST_API_KEY, { deferPreload: true });

  expect((SDKBase as any).__overlays__.size).toBe(0);

  const { overlay: A } = magic;
  const B = (SDKBase as any).__overlays__.values().next().value;

  expect((SDKBase as any).__overlays__.size).toBe(1);
  expect(A instanceof ViewController).toBe(true);
  expect(A).toBe(B);
});

test('`MagicSDK.overlay` is shared between `MagicSDK` instances with same parameters', async () => {
  const Ctor = createMagicSDKCtor();
  const magicA = new Ctor(TEST_API_KEY);
  const magicB = new Ctor(TEST_API_KEY);

  const { overlay: A } = magicA;
  const { overlay: B } = magicB;

  expect(A).toBe(B);
});

test('`MagicSDK.overlay` is unique between `MagicSDK` instances with different parameters', async () => {
  const Ctor = createMagicSDKCtor();
  const magicA = new Ctor(TEST_API_KEY);
  const magicB = new Ctor('asdfasdf');

  const { overlay: A } = magicA;
  const { overlay: B } = magicB;

  expect(A).not.toBe(B);
});
