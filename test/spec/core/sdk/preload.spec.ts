/* eslint-disable no-underscore-dangle */

import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { MagicSDK } from '../../../../src/core/sdk';
import { TEST_API_KEY } from '../../../lib/constants';
import { IframeController } from '../../../../src/core/iframe-controller';

test.beforeEach(t => {
  browserEnv.restore();
  (IframeController as any).prototype.waitForReady = sinon.stub().returns(Promise.resolve());
});

/**
 * `MagicSDK.preload` invokes `MagicSDK.overlay.ready`.
 *
 * Action Must:
 * - Await the promise returned by `MagicSDK.overlay.ready`.
 */
test('#01', async t => {
  const magic = new MagicSDK(TEST_API_KEY);
  await t.notThrowsAsync(() => magic.preload());
  t.true((magic as any).overlay.waitForReady.calledOnce);
});
