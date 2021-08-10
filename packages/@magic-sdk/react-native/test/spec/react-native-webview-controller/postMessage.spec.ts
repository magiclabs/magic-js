import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { createModalNotReadyError, MagicSDKError } from '@magic-sdk/provider';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv.restore();
  reactNativeStyleSheetStub();
});

test('Calls webView.postMessage with the expected arguments', async () => {
  const overlay = createReactNativeWebViewController('http://example.com');

  const postMessageStub = sinon.stub();
  (overlay as any).webView = { postMessage: postMessageStub };

  await overlay.postMessage({ thisIsData: 'hello world' });

  expect(postMessageStub.args[0]).toEqual([JSON.stringify({ thisIsData: 'hello world' }), 'http://example.com']);
});

test('Throws MODAL_NOT_READY error if webView is nil', async () => {
  const overlay = createReactNativeWebViewController();

  (overlay as any).webView = undefined;

  const expectedError = createModalNotReadyError();
  const error = await t.throwsAsync<MagicSDKError>(() => overlay.postMessage({ thisIsData: 'hello world' }));

  expect(error.code).toBe(expectedError.code);
  expect(error.message).toBe(expectedError.message);
});
