import browserEnv from '@ikscodes/browser-env';
import { createModalNotReadyError } from '@magic-sdk/provider';
import { createIframeController } from '../../factories';

beforeEach(() => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', jest.fn());
  // Don't let JSDOM try to load the iframe
  browserEnv.stub('document.body.appendChild', jest.fn());
});

test('Calls iframe.contentWindow.postMessage with the expected arguments', async () => {
  const overlay = createIframeController('http://example.com');

  const postMessageStub = jest.fn();
  (overlay as any).iframe = { contentWindow: { postMessage: postMessageStub } };

  await (overlay as any)._post({ thisIsData: 'hello world' });

  expect(postMessageStub.mock.calls[0]).toEqual([{ thisIsData: 'hello world' }, 'http://example.com']);
});

test('Throws MODAL_NOT_READY error if iframe.contentWindow is nil', async () => {
  const overlay = createIframeController();

  (overlay as any).iframe = undefined;

  const expectedError = createModalNotReadyError();
  expect(() => (overlay as any)._post({ thisIsData: 'hello world' })).rejects.toThrow(expectedError);
});
