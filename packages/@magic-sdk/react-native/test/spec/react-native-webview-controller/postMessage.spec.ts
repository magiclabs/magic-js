import browserEnv from '@ikscodes/browser-env';
import { createModalNotReadyError } from '@magic-sdk/provider';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv.restore();
  reactNativeStyleSheetStub();
});

test('Calls webView.postMessage with the expected arguments', async () => {
  const overlay = createReactNativeWebViewController('http://example.com');

  const postMessageStub = jest.fn();
  overlay.webView = { postMessage: postMessageStub };

  await overlay.postMessage({ thisIsData: 'hello world' });

  expect(postMessageStub.mock.calls[0]).toEqual([JSON.stringify({ thisIsData: 'hello world' }), 'http://example.com']);
});

test('Throws MODAL_NOT_READY error if webView is nil', async () => {
  const overlay = createReactNativeWebViewController();

  overlay.webView = undefined;

  const expectedError = createModalNotReadyError();

  expect(() => overlay.postMessage({ thisIsData: 'hello world' })).rejects.toThrow(expectedError);
});
