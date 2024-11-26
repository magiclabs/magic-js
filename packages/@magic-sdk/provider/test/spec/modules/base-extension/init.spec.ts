import browserEnv from '@ikscodes/browser-env';
import { Extension } from '../../../../src/modules/base-extension';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('`baseExtension.init` is no-op if already initialized', () => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  baseExtension.init(sdk);
  expect(baseExtension.sdk).toBe(sdk);

  baseExtension.init('hello world');
  expect(baseExtension.sdk).toBe(sdk);
});
