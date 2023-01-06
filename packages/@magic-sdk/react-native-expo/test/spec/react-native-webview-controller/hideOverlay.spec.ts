import browserEnv from '@ikscodes/browser-env';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv();
  reactNativeStyleSheetStub();
});

test('Call `container.hideOverlay` if present', () => {
  const overlay = createReactNativeWebViewController('asdf');
  const hideOverlayStub = jest.fn();

  overlay.container = {
    hideOverlay: hideOverlayStub,
  };

  overlay.hideOverlay();

  expect(hideOverlayStub).toBeCalledTimes(1);
});

test('Not call `container.hideOverlay` if `container` is nil', () => {
  const overlay = createReactNativeWebViewController('asdf');
  overlay.container = undefined;

  overlay.hideOverlay();
});
