import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { ENCODED_QUERY_PARAMS } from '../../constants';
import { createReactNativeTransport } from '../../factories';

beforeEach(() => {
  browserEnv();
});

test('Ignores events with different origin than expected', (done) => {
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
    expect(onHandlerStub.notCalled).toBe(true);
    done();
  }, 0);
});

test('Ignores events with non-string data', (done) => {
  const transport = createReactNativeTransport('asdf');
  const onHandlerStub = sinon.stub();
  (transport as any).messageHandlers.add(onHandlerStub);

  transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `qwerty/send/?params=${(transport as any).parameters}`,
      data: 123,
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub.notCalled).toBe(true);
    done();
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

test('Replaces `undefined` or `null` response with an empty object', (done) => {
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
    expect(onHandlerStub.calledOnce).toBe(true);
    expect(onHandlerStub.args[0][0].data).toEqual({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    done();
  }, 0);
});

test('Executes event handlers where `messageHandlers` size is > 0', (done) => {
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
    expect(onHandlerStub.calledOnce).toBe(true);
    expect(onHandlerStub.args[0][0].data).toEqual({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    done();
  }, 0);
});

test('Ignores event handlers where `messageHandlers` size is === 0', (done) => {
  const transport = createReactNativeTransport('asdf');
  (transport as any).messageHandlers = { size: 0 };

  transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} }),
    },
  } as any);

  setTimeout(() => {
    done();
  }, 0);
});
