/* eslint-disable no-new */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { BaseModule } from '../../../../src/modules/base-module';
import { createPayloadTransport, createIframeController } from '../../../factories';

test.beforeEach(t => {
  browserEnv.restore();
});

test.serial('Initialize `BaseModule`', t => {
  const payloadTransport = createPayloadTransport();
  const iframeController = createIframeController();

  const baseModule: any = new (BaseModule as any)(
    () => payloadTransport,
    () => iframeController,
  );

  const transportA = baseModule.getTransport();
  const transportB = baseModule.transport;

  const overlayA = baseModule.getOverlay();
  const overlayB = baseModule.overlay;

  t.true(baseModule instanceof BaseModule);

  t.is(payloadTransport, transportA);
  t.is(iframeController, overlayA);

  t.is(transportA, transportB);
  t.is(overlayA, overlayB);
});
