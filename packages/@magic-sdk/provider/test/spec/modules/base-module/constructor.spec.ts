/* eslint-disable no-new, global-require */

import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
});

test('Initialize `BaseModule`', () => {
  const sdk = createMagicSDK();

  const baseModule = new BaseModule(sdk);

  const transportA = (baseModule as any).transport;
  const transportB = (baseModule as any).sdk.transport;

  const overlayA = (baseModule as any).overlay;
  const overlayB = (baseModule as any).sdk.overlay;

  expect(baseModule instanceof BaseModule).toBe(true);
  expect(transportA).toBe(transportB);
  expect(overlayA).toBe(overlayB);
});
