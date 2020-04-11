import '../../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createIframeController } from '../../../../lib/factories';

test.beforeEach(t => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', sinon.stub());
});

/**
 * Hide Overlay
 *
 * Action Must:
 * - Change display of style to none
 */
test('#01', async t => {
  const overlay = createIframeController();

  (overlay as any).iframe = { style: { display: 'block' } };

  await (overlay as any).hideOverlay();

  t.deepEqual((overlay as any).iframe, { style: { display: 'none' } });
});
