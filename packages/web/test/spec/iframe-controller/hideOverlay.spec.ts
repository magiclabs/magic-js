import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createIframeController } from '../../factories';

test.beforeEach((t) => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', sinon.stub());
});

test('Change display style to `none`', async (t) => {
  const overlay = createIframeController();

  (overlay as any).iframe = {
    style: { display: 'block' },
  };

  await (overlay as any).hideOverlay();

  t.deepEqual((overlay as any).iframe, { style: { display: 'none' } });
});

test('If `activeElement` exists and can be focused, calls `activeElement.focus()`', async (t) => {
  const overlay = createIframeController();

  const focusStub = sinon.stub();

  (overlay as any).activeElement = {
    focus: focusStub,
  };

  (overlay as any).iframe = {
    style: { display: 'block' },
  };

  await (overlay as any).hideOverlay();

  t.true(focusStub.calledOnce);
  t.is((overlay as any).activeElement, null);
});
