import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { ENCODED_QUERY_PARAMS } from '../../constants';
import { createReactNativeTransport } from '../../factories';

test.beforeEach(t => {
  browserEnv();
});

test.cb('Ignores events with different origin than expected', t => {
  const transport = createReactNativeTransport('asdf');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `qwerty/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: '{}',
    },
  } as any);

  setTimeout(() => {
    t.true(onHandlerStub.notCalled);
    t.end();
  }, 0);
});

test.cb('Ignores events with non-string data', t => {
  const transport = createReactNativeTransport('asdf');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `qwerty/send/?params=${(transport as any).encodedQueryParams}`,
      data: 123,
    },
  } as any);

  setTimeout(() => {
    t.true(onHandlerStub.notCalled);
    t.end();
  }, 0);
});

// test.cb('Ignores events with undefined `data` attribute', t => {
//   const transport = createPayloadTransport('');
//   const onHandlerStub = sinon.stub();
//   (transport as any).messageHandlers.add(onHandlerStub);

//   window.postMessage(undefined, '*');

//   setTimeout(() => {
//     t.true(onHandlerStub.notCalled);
//     t.end();
//   }, 0);
// });

// test.cb('Ignores events with undefined `data.msgType`', t => {
//   const transport = createPayloadTransport('');
//   const onHandlerStub = sinon.stub();
//   (transport as any).messageHandlers.add(onHandlerStub);

//   window.postMessage({}, '*');

//   setTimeout(() => {
//     t.true(onHandlerStub.notCalled);
//     t.end();
//   }, 0);
// });

test.cb('Replaces `undefined` or `null` response with an empty object', t => {
  const transport = createReactNativeTransport('asdf');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}` }),
    },
  } as any);

  setTimeout(() => {
    t.true(onHandlerStub.calledOnce);
    t.deepEqual(onHandlerStub.args[0][0].data, { msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    t.end();
  }, 0);
});

test.cb('Executes event handlers where `messageHandlers` size is > 0', t => {
  const transport = createReactNativeTransport('asdf');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} }),
    },
  } as any);

  setTimeout(() => {
    t.true(onHandlerStub.calledOnce);
    t.deepEqual(onHandlerStub.args[0][0].data, { msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    t.end();
  }, 0);
});

test.cb('Ignores event handlers where `messageHandlers` size is === 0', t => {
  const transport = createReactNativeTransport('asdf');
  (transport as any).messageHandlers = { size: 0 };

  transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} }),
    },
  } as any);

  setTimeout(() => {
    t.end();
  }, 0);
});
