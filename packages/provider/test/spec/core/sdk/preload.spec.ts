/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { ViewController } from '../../../../src/core/view-controller';
import { createMagicSDK } from '../../../factories';

test.beforeEach(t => {
  browserEnv.restore();
  (ViewController as any).prototype.waitForReady = sinon.stub().returns(Promise.resolve());
});

test('`MagicSDK.preload` awaits `MagicSDK.overlay.ready`', async t => {
  const magic = createMagicSDK();
  await t.notThrowsAsync(() => magic.preload());
  t.true((magic as any).overlay.waitForReady.calledOnce);
});
