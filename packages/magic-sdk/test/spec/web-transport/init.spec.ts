import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { ENCODED_QUERY_PARAMS } from '../../constants';
import { createWebTransport } from '../../factories';

beforeEach(() => {
  browserEnv();
});

test('Adds `message` event listener', () => {
  const addEventListenerStub = sinon.stub();
  browserEnv.stub('addEventListener', addEventListenerStub);

  createWebTransport();

  expect(addEventListenerStub.args[0][0]).toBe('message');
});

test('Ignores events with different origin than expected', (done) => {
  const transport = createWebTransport('asdf');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    expect(onHandlerStub.notCalled).toBe(true);
    done();
  }, 0);
});

test('Ignores events with undefined `data` attribute', (done) => {
  const transport = createWebTransport('');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    expect(onHandlerStub.notCalled).toBe(true);
    done();
  }, 0);
});

test('Ignores events with undefined `data.msgType`', (done) => {
  const transport = createWebTransport('');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage({}, '*');

  setTimeout(() => {
    expect(onHandlerStub.notCalled).toBe(true);
    done();
  }, 0);
});

test('Executes events where `messageHandlers` size is > 0', (done) => {
  const transport = createWebTransport('');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    expect(onHandlerStub.calledOnce).toBe(true);
    expect(onHandlerStub.args[0][0].data).toEqual({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}`, response: {} });
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
