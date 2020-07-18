import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createModalNotReadyError, MagicSDKError } from '@magic-sdk/provider';
import { createIframeController } from '../../factories';

test.beforeEach((t) => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', sinon.stub());
});

test('Calls iframe.contentWindow.postMessage with the expected arguments', async (t) => {
  const overlay = createIframeController('http://example.com');

  const postMessageStub = sinon.stub();
  (overlay as any).iframe = { contentWindow: { postMessage: postMessageStub } };

  await overlay.postMessage({ thisIsData: 'hello world' });

  t.deepEqual(postMessageStub.args[0], [{ thisIsData: 'hello world' }, 'http://example.com']);
});

test('Throws MODAL_NOT_READY error if iframe.contentWindow is nil', async (t) => {
  const overlay = createIframeController();

  (overlay as any).iframe = undefined;

  const expectedError = createModalNotReadyError();
  const error = await t.throwsAsync<MagicSDKError>(() => overlay.postMessage({ thisIsData: 'hello world' }));

  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});
