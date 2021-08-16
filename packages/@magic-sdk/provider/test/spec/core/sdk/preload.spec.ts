/* eslint-disable no-underscore-dangle */

import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { ViewController } from '../../../../src/core/view-controller';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  (ViewController as any).prototype.waitForReady = sinon.stub().returns(Promise.resolve());
});

test('`MagicSDK.preload` awaits `MagicSDK.overlay.ready`', async () => {
  const magic = createMagicSDK();
  magic.preload();
  expect(magic.overlay.waitForReady.calledOnce).toBe(true);
});
