import browserEnv from '@ikscodes/browser-env';
import { IframeController } from '../../../src/iframe-controller';
import { ENCODED_QUERY_PARAMS, MAGIC_RELAYER_FULL_URL } from '../../constants';
import { createIframeController } from '../../factories';

function createOverlayElementsStub() {
  const classListAddStub = jest.fn();

  const createElementStub = jest.fn().mockImplementation(arg => {
    if (arg === 'iframe') {
      return {
        className: null,
        src: null,
        classList: { add: classListAddStub },
        dataset: {},
        style: { visibility: 'hidden' },
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
  (IframeController.prototype as any).listen = jest.fn();
});

test('Appends header with style, appends body with iframe, and resolves iframe', async () => {
  const { appendChildStub, classListAddStub, createElementStub } = createOverlayElementsStub();

  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('removeEventListener', jest.fn());
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

  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('removeEventListener', jest.fn());
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

  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('removeEventListener', jest.fn());
  browserEnv.stub('document.querySelectorAll', () => ({ length: 0 }));
  browserEnv.stub('document.createElement', createElementStub);
  browserEnv.stub('document.readyState', 'initializing');
  browserEnv.stub('document.body.appendChild', appendChildStub);

  createIframeController();

  expect((window as any).addEventListener.mock.calls[0][0]).toBe('load');
});

test('Assumes the iframe is not yet initialized if `src` is `undefined`', async () => {
  const { classListAddStub, createElementStub } = createOverlayElementsStub();
  const appendChildStub = jest.fn();

  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('removeEventListener', jest.fn());
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

test('Adds `message` event listener', () => {
  const addEventListenerStub = jest.fn();
  browserEnv.stub('addEventListener', addEventListenerStub);
  browserEnv.stub('removeEventListener', jest.fn());

  createIframeController();

  expect(addEventListenerStub.mock.calls[0][0]).toBe('message');
});

test('Ignores events with different origin than expected', done => {
  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('removeEventListener', jest.fn());

  const viewController = createIframeController('http://asdf');
  const onHandlerStub = jest.fn();
  (viewController as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 0);
});

test('Ignores events with undefined `data` attribute', done => {
  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('removeEventListener', jest.fn());

  const viewController = createIframeController();
  const onHandlerStub = jest.fn();
  (viewController as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 0);
});

test('Ignores events with undefined `data.msgType`', done => {
  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('removeEventListener', jest.fn());

  const viewController = createIframeController();
  const onHandlerStub = jest.fn();
  (viewController as any).messageHandlers.add(onHandlerStub);

  window.postMessage({}, '*');

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 0);
});

test('Executes events where `messageHandlers` size is > 0', done => {
  const viewController = createIframeController();
  const onHandlerStub = jest.fn();
  (viewController as any).endpoint = ''; // Force `event.origin` and `this.endpoint` to be equivalent
  (viewController as any).on('asdfasdf', onHandlerStub);

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    expect(onHandlerStub).toBeCalledTimes(1);
    expect(onHandlerStub.mock.calls[0][0].data).toEqual({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    done();
  }, 0);
});

test('Ignores events where `messageHandlers` size is === 0', done => {
  browserEnv.stub('location', new URL(MAGIC_RELAYER_FULL_URL));

  const viewController = createIframeController();
  (viewController as any).endpoint = ''; // Force `event.origin` and `this.endpoint` to be equivalent
  (viewController as any).messageHandlers = { size: 0 };

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    done();
  }, 0);
});

test('Ignores events where `event.origin` and `this.endpoint` are not equivalent', done => {
  browserEnv.stub('location', new URL(MAGIC_RELAYER_FULL_URL));

  const viewController = createIframeController();
  (viewController as any).messageHandlers = { size: 0 };

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    done();
  }, 0);
});
