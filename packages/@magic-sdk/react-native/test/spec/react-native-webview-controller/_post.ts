import browserEnv from '@ikscodes/browser-env';
import { createModalNotReadyError } from '@magic-sdk/provider';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv.restore();
  reactNativeStyleSheetStub();
});

test('Calls webView._post with the expected arguments', async () => {
  const overlay = createReactNativeWebViewController('http://example.com');

  const postStub = jest.fn();
  overlay.webView = { _post: postStub };

  await overlay._post({ thisIsData: 'hello world' });

  expect(postStub.mock.calls[0]).toEqual([JSON.stringify({ thisIsData: 'hello world' }), 'http://example.com']);
});

test('Throws MODAL_NOT_READY error if webView is nil', async () => {
  const overlay = createReactNativeWebViewController();

  overlay.webView = undefined;

  const expectedError = createModalNotReadyError();

  expect(() => overlay._post({ thisIsData: 'hello world' })).rejects.toThrow(expectedError);
});
