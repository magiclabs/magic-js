import browserEnv from '@ikscodes/browser-env';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv();
  reactNativeStyleSheetStub();
});

test('Call `container.showOverlay` if present', () => {
  const overlay = createReactNativeWebViewController('asdf');
  const showOverlayStub = jest.fn();

  overlay.container = {
    showOverlay: showOverlayStub,
  };

  overlay.showOverlay();

  expect(showOverlayStub).toBeCalledTimes(1);
});

test('Not call `container.showOverlay` if `container` is nil', () => {
  const overlay = createReactNativeWebViewController('asdf');
  overlay.container = undefined;
  overlay.showOverlay();
});
