import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

test.beforeEach((t) => {
  browserEnv();
  reactNativeStyleSheetStub();
});

test('Call `container.hideOverlay` if present', (t) => {
  const overlay = createReactNativeWebViewController('asdf');
  const hideOverlayStub = sinon.stub();
  (overlay as any).container = {
    hideOverlay: hideOverlayStub,
  };

  (overlay as any).hideOverlay();

  t.true(hideOverlayStub.calledOnce);
});

test('Not call `container.hideOverlay` if `container` is nil', (t) => {
  const overlay = createReactNativeWebViewController('asdf');
  (overlay as any).container = undefined;

  (overlay as any).hideOverlay();

  t.pass();
});
