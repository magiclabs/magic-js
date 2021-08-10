import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { createViewController } from '../../../factories';
import { MSG_TYPES } from '../../../constants';

beforeEach(() => {
  browserEnv();
});

test('Receive MAGIC_HIDE_OVERLAY, call `hideOverlay`', (done) => {
  const overlay = createViewController('');
  const hideOverlayStub = sinon.stub();
  (overlay as any).hideOverlay = hideOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_HIDE_OVERLAY }, '*');

  setTimeout(() => {
    expect(hideOverlayStub.calledOnce).toBe(true);
    done();
  }, 0);
});

test('Receive MAGIC_SHOW_OVERLAY, call `showOverlay`', (done) => {
  const overlay = createViewController('');
  const showOverlayStub = sinon.stub();
  (overlay as any).showOverlay = showOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_SHOW_OVERLAY }, '*');

  setTimeout(() => {
    expect(showOverlayStub.calledOnce).toBe(true);
    done();
  }, 0);
});
