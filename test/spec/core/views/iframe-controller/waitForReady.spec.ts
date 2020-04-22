import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { IframeController } from '../../../../../src/core/views/iframe-controller';
import { createIframeController } from '../../../../factories';
import { MSG_TYPES } from '../../../../constants';

test.beforeEach(t => {
  browserEnv();

  (IframeController.prototype as any).init = () => {}; // overriding createOverlay to prevent `onload` promise
  (IframeController.prototype as any).showOverlay = () => {};
  (IframeController.prototype as any).hideOverlay = () => {};
});

test.cb('Receive MAGIC_OVERLAY_READY, resolve `waitForReady` promise', t => {
  const overlay = createIframeController('');
  const waitForReady = (overlay as any).waitForReady();

  waitForReady.then(() => {
    t.end();
  });

  window.postMessage({ msgType: MSG_TYPES().MAGIC_OVERLAY_READY }, '*');
});
