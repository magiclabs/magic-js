import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { ENCODED_QUERY_PARAMS } from '../../../constants';
import { createPayloadTransport } from '../../../factories';

test.beforeEach(t => {
  browserEnv();
});

/**
 * Adds 'message' event listener
 *
 * Action Must:
 * - Register a 'message' event listener on `window`
 */
test.serial('#01', t => {
  const addEventListenerStub = sinon.stub();
  browserEnv.stub('addEventListener', addEventListenerStub);

  createPayloadTransport();

  t.is(addEventListenerStub.args[0][0], 'message');
});

/**
 * Ignores events with different origin than expected
 *
 * Action Must:
 * - Not execute event callbacks
 */
test.cb('#02', t => {
  const transport = createPayloadTransport('asdf');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    t.true(onHandlerStub.notCalled);
    t.end();
  }, 0);
});

/**
 * Ignores events with undefined `data` attribute
 *
 * Action Must:
 * - Not execute event callbacks
 */
test.cb('#03', t => {
  const transport = createPayloadTransport('');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage(undefined, '*');

  setTimeout(() => {
    t.true(onHandlerStub.notCalled);
    t.end();
  }, 0);
});

/**
 * Ignores events with undefined `data.msgType`
 *
 * Action Must:
 * - Not execute event callbacks
 */
test.cb('#04', t => {
  const transport = createPayloadTransport('');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage({}, '*');

  setTimeout(() => {
    t.true(onHandlerStub.notCalled);
    t.end();
  }, 0);
});

/**
 * Executes events where `messageHandlers` size is > 0
 *
 * Action Must:
 * - Eecute event callbacks
 */
test.cb('#05', t => {
  const transport = createPayloadTransport('');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    t.true(onHandlerStub.calledOnce);
    t.deepEqual(onHandlerStub.args[0][0].data, { msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    t.end();
  }, 0);
});

/**
 * Ignores events where `messageHandlers` size is === 0
 *
 * Action Must:
 * - Not execute event callbacks
 */
test.cb('#06', t => {
  const transport = createPayloadTransport('');
  (transport as any).messageHandlers = { size: 0 };

  window.postMessage({ msgType: `asdfasdf-${ENCODED_QUERY_PARAMS}` }, '*');

  setTimeout(() => {
    t.end();
  }, 0);
});
