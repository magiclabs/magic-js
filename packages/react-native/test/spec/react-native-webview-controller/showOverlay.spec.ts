import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

test.beforeEach((t) => {
  browserEnv();
  reactNativeStyleSheetStub();
});

test('Call `container.showOverlay` if present', (t) => {
  const overlay = createReactNativeWebViewController('asdf');
  const showOverlayStub = sinon.stub();
  (overlay as any).container = {
    showOverlay: showOverlayStub,
  };

  (overlay as any).showOverlay();

  t.true(showOverlayStub.calledOnce);
});

test('Not call `container.showOverlay` if `container` is nil', (t) => {
  const overlay = createReactNativeWebViewController('asdf');
  (overlay as any).container = undefined;

  (overlay as any).showOverlay();

  t.pass();
});
