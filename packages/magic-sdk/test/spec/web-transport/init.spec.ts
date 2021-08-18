import browserEnv from '@ikscodes/browser-env';
import { ENCODED_QUERY_PARAMS } from '../../constants';
import { createWebTransport } from '../../factories';

beforeEach(() => {
  browserEnv();
});

test('Adds `message` event listener', () => {
  const addEventListenerStub = jest.fn();
  browserEnv.stub('addEventListener', addEventListenerStub);

  createWebTransport();

  expect(addEventListenerStub.mock.calls[0][0]).toBe('message');
});

test('Ignores events with different origin than expected', (done) => {
  const transport = createWebTransport('asdf');
  const onHandlerStub = jest.fn();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 0);
});

test('Ignores events with undefined `data` attribute', (done) => {
  const transport = createWebTransport('');
  const onHandlerStub = jest.fn();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 0);
});

test('Ignores events with undefined `data.msgType`', (done) => {
  const transport = createWebTransport('');
  const onHandlerStub = jest.fn();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage({}, '*');

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 0);
});

test('Executes events where `messageHandlers` size is > 0', (done) => {
  const transport = createWebTransport('');
  const onHandlerStub = jest.fn();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    expect(onHandlerStub).toBeCalledTimes(1);
    expect(onHandlerStub.mock.calls[0][0].data).toEqual({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    done();
  }, 0);
});

test('Ignores events where `messageHandlers` size is === 0', (done) => {
  const transport = createWebTransport('');
  (transport as any).messageHandlers = { size: 0 };

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    done();
  }, 0);
});
