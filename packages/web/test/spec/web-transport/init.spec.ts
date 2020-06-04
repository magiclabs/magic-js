import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { ENCODED_QUERY_PARAMS } from '../../constants';
import { createWebTransport } from '../../factories';

test.beforeEach(t => {
  browserEnv();
});

test.serial('Adds `message` event listener', t => {
  const addEventListenerStub = sinon.stub();
  browserEnv.stub('addEventListener', addEventListenerStub);

  createWebTransport();

  t.is(addEventListenerStub.args[0][0], 'message');
});

test.cb('Ignores events with different origin than expected', t => {
  const transport = createWebTransport('asdf');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    t.true(onHandlerStub.notCalled);
    t.end();
  }, 0);
});

test.cb('Ignores events with undefined `data` attribute', t => {
  const transport = createWebTransport('');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    t.true(onHandlerStub.notCalled);
    t.end();
  }, 0);
});

test.cb('Ignores events with undefined `data.msgType`', t => {
  const transport = createWebTransport('');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage({}, '*');

  setTimeout(() => {
    t.true(onHandlerStub.notCalled);
    t.end();
  }, 0);
});

test.cb('Executes events where `messageHandlers` size is > 0', t => {
  const transport = createWebTransport('');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    t.true(onHandlerStub.calledOnce);
    t.deepEqual(onHandlerStub.args[0][0].data, { msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    t.end();
  }, 0);
});

test.cb('Ignores events where `messageHandlers` size is === 0', t => {
  const transport = createWebTransport('');
  (transport as any).messageHandlers = { size: 0 };

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    t.end();
  }, 0);
});
