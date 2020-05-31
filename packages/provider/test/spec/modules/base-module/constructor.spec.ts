/* eslint-disable no-new, global-require */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { createMagicSDK } from '../../../factories';

/**
 * We have a circular dependency breaking test code when the `BaseModule`
 * constructor is referenced. Rather than refactor the SDK code, it was quicker
 * to fix the issue with JS getters.
 */
const ModuleCtors = {
  get BaseModule() {
    return (require('../../../../src/modules/base-module') as typeof import('../../../../src/modules/base-module'))
      .BaseModule;
  },
};

test.beforeEach(t => {
  browserEnv.restore();
});

test.serial('Initialize `BaseModule`', t => {
  const sdk = createMagicSDK();

  const baseModule = new ModuleCtors.BaseModule(sdk);

  const transportA = (baseModule as any).transport;
  const transportB = (baseModule as any).sdk.transport;

  const overlayA = (baseModule as any).overlay;
  const overlayB = (baseModule as any).sdk.overlay;

  t.true(baseModule instanceof ModuleCtors.BaseModule);
  t.is(transportA, transportB);
  t.is(overlayA, overlayB);
});
