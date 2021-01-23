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

  (overlay as any).iframe = {
    style: { display: 'none' },
    focus: () => {},
  };

  await (overlay as any).showOverlay();

  t.is((overlay as any).iframe.style.display, 'block');
});

test('Calls `iframe.focus()`', async (t) => {
  const overlay = createIframeController();

  const focusStub = sinon.stub();
  (overlay as any).iframe = {
    style: { display: 'none' },
    focus: focusStub,
  };

  await (overlay as any).showOverlay();

  t.true(focusStub.calledOnce);
});

test('Saves the current `document.activeElement`', async (t) => {
  const overlay = createIframeController();

  browserEnv.stub('document.activeElement', 'qwertyqwerty');

  (overlay as any).iframe = {
    style: { display: 'none' },
    focus: () => {},
  };

  t.is((overlay as any).activeElement, null);

  await (overlay as any).showOverlay();

  t.is((overlay as any).activeElement, 'qwertyqwerty');
});
