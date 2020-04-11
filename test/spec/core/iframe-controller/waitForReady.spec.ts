import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { IframeController } from '../../../../src/core/views/iframe-controller';
import { createIframeController } from '../../../lib/factories';
import { MSG_TYPES } from '../../../lib/constants';

test.beforeEach(t => {
  browserEnv();

  (IframeController.prototype as any).init = () => {}; // overriding createOverlay to prevent `onload` promise
  (IframeController.prototype as any).showOverlay = () => {};
  (IframeController.prototype as any).hideOverlay = () => {};
});

/**
 * Receive MAGIC_OVERLAY_READY
 *
 * Action Must:
 * - Resolve `waitForReady` promise.
 */
test.cb('#01 MAGIC_OVERLAY_READY', t => {
  const overlay = createIframeController('');
  const waitForReady = (overlay as any).waitForReady();

  waitForReady.then(() => {
    t.end();
  });

  window.postMessage({ msgType: MSG_TYPES().MAGIC_OVERLAY_READY }, '*');
});
