import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createIframeController } from '../../factories';

test.beforeEach((t) => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', sinon.stub());
});

test('Change display style to `block`', async (t) => {
  const overlay = createIframeController();

  const focusStub = sinon.stub();

  (overlay as any).iframe = {
    style: { display: 'none' },
    focus: focusStub,
  };

  await (overlay as any).showOverlay();

  t.deepEqual((overlay as any).iframe, { style: { display: 'block' } });
  t.true(focusStub.calledOnce);
});
