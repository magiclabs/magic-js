/* eslint-disable @typescript-eslint/no-empty-function */

import browserEnv from '@ikscodes/browser-env';
import { IframeController } from '../../../src/iframe-controller';
import { ENCODED_QUERY_PARAMS, MAGIC_RELAYER_FULL_URL } from '../../constants';
import { createIframeController } from '../../factories';

function createOverlayElementsStub() {
  const classListAddStub = jest.fn();

  const createElementStub = jest.fn().mockImplementation((arg) => {
    if (arg === 'iframe') {
      return {
        className: null,
        src: null,
        classList: { add: classListAddStub },
        dataset: {},
        style: { display: 'none' },
      };
    }

    if (arg === 'img') {
      return { src: null, style: {} };
    }

    return undefined;
  });

  const appendChildStub = jest.fn();

  return {
    appendChildStub,
    classListAddStub,
    createElementStub,
  };
}

beforeEach(() => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('removeEventListener', jest.fn());
  (IframeController.prototype as any).listen = jest.fn();
});

test('Appends header with style, appends body with iframe, and resolves iframe', async () => {
  const { appendChildStub, classListAddStub, createElementStub } = createOverlayElementsStub();

  browserEnv.stub('document.querySelectorAll', () => ({ length: 0 }));
  browserEnv.stub('document.createElement', createElementStub);
  browserEnv.stub('document.readyState', 'loaded');
  browserEnv.stub('document.body.appendChild', appendChildStub);

  const overlay = createIframeController();
  const iframe = await (overlay as any).iframe;

  expect((appendChildStub.mock.calls[0][0] as HTMLIFrameElement).src).toBe(
    `${MAGIC_RELAYER_FULL_URL}/send?params=${ENCODED_QUERY_PARAMS}`,
  );
  expect(classListAddStub).toBeCalledWith('magic-iframe');
  expect(iframe.dataset).toEqual({ magicIframeLabel: 'auth.magic.link' });
  expect(iframe.src).toBe(`${MAGIC_RELAYER_FULL_URL}/send?params=${ENCODED_QUERY_PARAMS}`);
  expect(iframe.title).toBe('Secure Modal');
});

test('Displays warning in console upon duplicate iframes', async () => {
  const { appendChildStub, createElementStub } = createOverlayElementsStub();

  browserEnv.stub('document.querySelectorAll', () => [{ src: ENCODED_QUERY_PARAMS }]);
  browserEnv.stub('document.createElement', createElementStub);
  browserEnv.stub('document.readyState', 'loaded');
  browserEnv.stub('document.body.appendChild', appendChildStub);

  const consoleWarnStub = jest.spyOn(console, 'warn').mockImplementation();

  createIframeController();

  expect(consoleWarnStub.mock.calls[0]).toEqual(['Magic SDK Warning: [DUPLICATE_IFRAME] Duplicate iframes found.']);
});

test('Waits until `document` is loaded/ready', async () => {
  const { appendChildStub, createElementStub } = createOverlayElementsStub();

  browserEnv.stub('document.querySelectorAll', () => ({ length: 0 }));
  browserEnv.stub('document.createElement', createElementStub);
  browserEnv.stub('document.readyState', 'initializing');
  browserEnv.stub('document.body.appendChild', appendChildStub);

  createIframeController();

  expect((window as any).addEventListener.mock.calls[1][0]).toBe('load');
});

test('Assumes the iframe is not yet initialized if `src` is `undefined`', async () => {
  const { classListAddStub, createElementStub } = createOverlayElementsStub();
  const appendChildStub = jest.fn();

  browserEnv.stub('document.querySelectorAll', () => ({ length: 0 }));
  browserEnv.stub('document.createElement', createElementStub);
  browserEnv.stub('document.readyState', 'loaded');
  browserEnv.stub('document.body.appendChild', appendChildStub);

  const overlay = createIframeController();
  const iframe = await (overlay as any).iframe;

  expect((appendChildStub.mock.calls[0][0] as HTMLIFrameElement).src).toBe(
    `${MAGIC_RELAYER_FULL_URL}/send?params=${ENCODED_QUERY_PARAMS}`,
  );
  expect(classListAddStub).toBeCalledWith('magic-iframe');
  expect(iframe.dataset).toEqual({ magicIframeLabel: 'auth.magic.link' });
  expect(iframe.src).toBe(`${MAGIC_RELAYER_FULL_URL}/send?params=${ENCODED_QUERY_PARAMS}`);
});
