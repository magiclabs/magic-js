/* eslint-disable no-new */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { BaseModule } from '../../../../src/modules/base-module';
import { createPayloadTransport, createIframeController, createMagicSDK } from '../../../factories';

test.beforeEach(t => {
  browserEnv.restore();
});

test.serial('Initialize `BaseModule`', t => {
  const sdk = createMagicSDK();

  const baseModule: any = new (BaseModule as any)(sdk);

  const transportA = baseModule.transport;
  const transportB = baseModule.sdk.transport;

  const overlayA = baseModule.overlay;
  const overlayB = baseModule.sdk.overlay;

  t.true(baseModule instanceof BaseModule);
  t.is(transportA, transportB);
  t.is(overlayA, overlayB);
});
