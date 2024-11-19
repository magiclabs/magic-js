import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
});

test('Initialize `BaseModule`', () => {
  const sdk = createMagicSDK();

  const baseModule = new BaseModule(sdk);

  const overlayA = (baseModule as any).overlay;
  const overlayB = (baseModule as any).sdk.overlay;

  expect(baseModule instanceof BaseModule).toBe(true);
  expect(overlayA).toBe(overlayB);
});
