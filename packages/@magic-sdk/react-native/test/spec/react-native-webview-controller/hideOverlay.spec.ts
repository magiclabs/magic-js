import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv();
  reactNativeStyleSheetStub();
});

test('Call `container.hideOverlay` if present', () => {
  const overlay = createReactNativeWebViewController('asdf');
  const hideOverlayStub = sinon.stub();
  (overlay as any).container = {
    hideOverlay: hideOverlayStub,
  };

  (overlay as any).hideOverlay();

  expect(hideOverlayStub.calledOnce).toBe(true);
});

test('Not call `container.hideOverlay` if `container` is nil', () => {
  const overlay = createReactNativeWebViewController('asdf');
  (overlay as any).container = undefined;

  (overlay as any).hideOverlay();
});
