import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv();
  reactNativeStyleSheetStub();
});

test('Call `container.showOverlay` if present', () => {
  const overlay = createReactNativeWebViewController('asdf');
  const showOverlayStub = sinon.stub();
  (overlay as any).container = {
    showOverlay: showOverlayStub,
  };

  (overlay as any).showOverlay();

  expect(showOverlayStub.calledOnce).toBe(true);
});

test('Not call `container.showOverlay` if `container` is nil', () => {
  const overlay = createReactNativeWebViewController('asdf');
  (overlay as any).container = undefined;

  (overlay as any).showOverlay();
});
