/* eslint-disable no-new, global-require */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

test.beforeEach((t) => {
  browserEnv.restore();
});

test.serial('Initialize `BaseModule`', (t) => {
  const sdk = createMagicSDK();

  const baseModule = new BaseModule(sdk);

  const transportA = (baseModule as any).transport;
  const transportB = (baseModule as any).sdk.transport;

  const overlayA = (baseModule as any).overlay;
  const overlayB = (baseModule as any).sdk.overlay;

  t.true(baseModule instanceof BaseModule);
  t.is(transportA, transportB);
  t.is(overlayA, overlayB);
});
