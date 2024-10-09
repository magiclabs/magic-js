import browserEnv from '@ikscodes/browser-env';
import { createViewController } from '../../../factories';
import { MSG_TYPES } from '../../../constants';

beforeEach(() => {
  browserEnv();
});

test('Receive MAGIC_OVERLAY_READY, resolve `waitForReady` promise', (done) => {
  const overlay = createViewController('');
  const waitForReady = (overlay as any).waitForReady();

  waitForReady.then(() => {
    done();
  });

  window.postMessage({ msgType: MSG_TYPES().MAGIC_OVERLAY_READY }, '*');
});

test('Resolve `waitForReady` promise after timeout', (done) => {
  jest.useFakeTimers();
  const overlay = createViewController('');
  const waitForReady = (overlay as any).waitForReady();

  waitForReady.then(() => {
    done();
  });

  // Fast forward time to 15 seconds
  jest.advanceTimersByTime(15000);
  jest.useRealTimers();
});
