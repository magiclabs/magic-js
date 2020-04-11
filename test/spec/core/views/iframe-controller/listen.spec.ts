import '../../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { IframeController } from '../../../../../src/core/views/iframe-controller';
import { createIframeController } from '../../../../lib/factories';
import { MSG_TYPES } from '../../../../lib/constants';

test.beforeEach(t => {
  browserEnv();

  (IframeController.prototype as any).init = () => {}; // overriding createOverlay to prevent `onload` promise
  (IframeController.prototype as any).showOverlay = () => {};
  (IframeController.prototype as any).hideOverlay = () => {};
});

/**
 * Receive MAGIC_HIDE_OVERLAY
 *
 * Action Must:
 * - Call hide Overlay
 */
test.cb('#01 MAGIC_HIDE_OVERLAY', t => {
  const overlay = createIframeController('');
  const hideOverlayStub = sinon.stub();
  (overlay as any).hideOverlay = hideOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_HIDE_OVERLAY }, '*');

  setTimeout(() => {
    t.true(hideOverlayStub.calledOnce);
    t.end();
  }, 0);
});

/**
 * Receive MAGIC_SHOW_OVERLAY
 *
 * Action Must:
 * - Call Show Overlay
 */
test.cb('#02 MAGIC_SHOW_OVERLAY', t => {
  const overlay = createIframeController('');
  const showOverlayStub = sinon.stub();
  (overlay as any).showOverlay = showOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_SHOW_OVERLAY }, '*');

  setTimeout(() => {
    t.true(showOverlayStub.calledOnce);
    t.end();
  }, 0);
});
