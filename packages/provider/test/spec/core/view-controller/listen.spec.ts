import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createViewController } from '../../../factories';
import { MSG_TYPES } from '../../../constants';

test.beforeEach((t) => {
  browserEnv();
});

test.cb('Receive MAGIC_HIDE_OVERLAY, call `hideOverlay`', (t) => {
  const overlay = createViewController('');
  const hideOverlayStub = sinon.stub();
  (overlay as any).hideOverlay = hideOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_HIDE_OVERLAY }, '*');

  setTimeout(() => {
    t.true(hideOverlayStub.calledOnce);
    t.end();
  }, 0);
});

test.cb('Receive MAGIC_SHOW_OVERLAY, call `showOverlay`', (t) => {
  const overlay = createViewController('');
  const showOverlayStub = sinon.stub();
  (overlay as any).showOverlay = showOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_SHOW_OVERLAY }, '*');

  setTimeout(() => {
    t.true(showOverlayStub.calledOnce);
    t.end();
  }, 0);
});
