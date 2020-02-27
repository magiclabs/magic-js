import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createIframeController } from '../../../lib/factories';

test.beforeEach(t => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', sinon.stub());
});

/**
 * Show Overlay
 *
 * Action Must:
 * - Change display of style to block
 */
test('#01', async t => {
  const overlay = createIframeController();

  (overlay as any).iframe = { style: { display: 'none' } };

  await (overlay as any).showOverlay();

  t.deepEqual((overlay as any).iframe, { style: { display: 'block' } });
});
