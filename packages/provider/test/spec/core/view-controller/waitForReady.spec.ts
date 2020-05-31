import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { createViewController } from '../../../factories';
import { MSG_TYPES } from '../../../constants';

test.beforeEach(t => {
  browserEnv();
});

test.cb('Receive MAGIC_OVERLAY_READY, resolve `waitForReady` promise', t => {
  const overlay = createViewController('');
  const waitForReady = (overlay as any).waitForReady();

  waitForReady.then(() => {
    t.end();
  });

  window.postMessage({ msgType: MSG_TYPES().MAGIC_OVERLAY_READY }, '*');
});
