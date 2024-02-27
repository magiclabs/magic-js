import browserEnv from '@ikscodes/browser-env';
import { createViewController } from '../../../factories';
import { MSG_TYPES } from '../../../constants';
import { MagicSDKWarning } from '../../../../src/core/sdk-exceptions';

beforeEach(() => {
  browserEnv();
});

test('Receive MAGIC_HIDE_OVERLAY, call `hideOverlay`', (done) => {
  const overlay = createViewController('');
  const hideOverlayStub = jest.fn();
  overlay.hideOverlay = hideOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_HIDE_OVERLAY }, '*');

  setTimeout(() => {
    expect(hideOverlayStub).toBeCalledTimes(1);
    done();
  }, 0);
});

test('Receive MAGIC_SHOW_OVERLAY, call `showOverlay`', (done) => {
  const overlay = createViewController('');
  const showOverlayStub = jest.fn();
  overlay.showOverlay = showOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_SHOW_OVERLAY }, '*');

  setTimeout(() => {
    expect(showOverlayStub).toBeCalledTimes(1);
    done();
  }, 0);
});

test('Receive MAGIC_SEND_PRODUCT_ANNOUNCEMENT, log product announcement', (done) => {
  const overlay = createViewController('');
  const productAnnouncement = 'New feature available!';
  const logSpy = jest.spyOn(MagicSDKWarning.prototype, 'log');

  // Simulate posting the MAGIC_SEND_PRODUCT_ANNOUNCEMENT message with a product announcement
  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_SEND_PRODUCT_ANNOUNCEMENT,
      response: {
        result: {
          product_announcement: productAnnouncement,
        },
      },
    },
    '*',
  );
  setTimeout(() => {
    expect(logSpy).toHaveBeenCalled();
    done();
  }, 0);
});
