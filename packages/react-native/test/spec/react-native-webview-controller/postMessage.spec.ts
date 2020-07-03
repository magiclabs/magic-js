import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createModalNotReadyError, MagicSDKError } from '@magic-sdk/provider';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

test.beforeEach((t) => {
  browserEnv.restore();
  reactNativeStyleSheetStub();
});

test('Calls webView.postMessage with the expected arguments', async (t) => {
  const overlay = createReactNativeWebViewController();

  const postMessageStub = sinon.stub();
  (overlay as any).webView = { postMessage: postMessageStub };

  await overlay.postMessage({ thisIsData: 'hello world' });

  t.deepEqual(postMessageStub.args[0], [JSON.stringify({ thisIsData: 'hello world' }), '*']);
});

test('Throws MODAL_NOT_READY error if webView is nil', async (t) => {
  const overlay = createReactNativeWebViewController();

  (overlay as any).webView = undefined;

  const expectedError = createModalNotReadyError();
  const error = await t.throwsAsync<MagicSDKError>(() => overlay.postMessage({ thisIsData: 'hello world' }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});
