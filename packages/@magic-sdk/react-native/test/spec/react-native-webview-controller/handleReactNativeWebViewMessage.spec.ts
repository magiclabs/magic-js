import browserEnv from '@ikscodes/browser-env';
import { ENCODED_QUERY_PARAMS } from '../../constants';
import { createReactNativeWebViewController } from '../../factories';

beforeEach(() => {
  browserEnv();
});

test('Ignores events with different origin than expected', (done) => {
  const viewController = createReactNativeWebViewController('asdf');
  const onHandlerStub = jest.fn();
  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `qwerty/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: '{}',
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 100);
});

test('Ignores events with non-string data', (done) => {
  const viewController = createReactNativeWebViewController('asdf');
  const onHandlerStub = jest.fn();
  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `qwerty/send/?params=${viewController.parameters}`,
      data: 123,
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 100);
});

test('Replaces `undefined` or `null` response with an empty object', (done) => {
  const viewController = createReactNativeWebViewController('asdf');
  const onHandlerStub = jest.fn();
  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}` }),
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).toBeCalledTimes(1);
    expect(onHandlerStub.mock.calls[0][0].data).toEqual({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    done();
  }, 100);
});

test('Executes event handlers where `messageHandlers` size is > 0', (done) => {
  const viewController = createReactNativeWebViewController('asdf');
  const onHandlerStub = jest.fn();
  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} }),
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).toBeCalledTimes(1);
    expect(onHandlerStub.mock.calls[0][0].data).toEqual({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    done();
  }, 100);
});

test('Ignores event handlers where `messageHandlers` size is === 0', (done) => {
  const viewController = createReactNativeWebViewController('asdf');
  viewController.messageHandlers = { size: 0 };

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} }),
    },
  } as any);

  setTimeout(() => {
    done();
  }, 100);
});

test('Process Typed Array in Solana Payload', (done) => {
  const viewController = createReactNativeWebViewController('asdf');
  const onHandlerStub = jest.fn();

  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({
        msgType: `asdf-${ENCODED_QUERY_PARAMS}`,
        response: {
          result: {
            rawTransaction: {
              constructor: 'Uint8Array',
              data: '21,0,0,0',
              flag: 'MAGIC_PAYLOAD_FLAG_TYPED_ARRAY',
            },
          },
        },
      }),
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).toBeCalledTimes(1);
    expect(onHandlerStub.mock.calls[0][0].data).toEqual({
      msgType: `asdf-${ENCODED_QUERY_PARAMS}`,
      response: { result: { rawTransaction: new Uint8Array([21, 0, 0, 0]) } },
    });
    done();
  }, 100);
});

test('Process Typed Array in Solana Payload', (done) => {
  const viewController = createReactNativeWebViewController('asdf');
  const onHandlerStub = jest.fn();

  viewController.messageHandlers.add(onHandlerStub);

  const unrecognizedObject = {
    constructor: 'Uint8Array',
    data: ['21,0,0,0'],
    flag: 'MAGIC_PAYLOAD_FLAG_TYPED_ARRAY',
  };

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({
        msgType: `asdf-${ENCODED_QUERY_PARAMS}`,
        response: {
          result: {
            rawTransaction: unrecognizedObject,
          },
        },
      }),
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).toBeCalledTimes(1);
    expect(onHandlerStub.mock.calls[0][0].data).toEqual({
      msgType: `asdf-${ENCODED_QUERY_PARAMS}`,
      response: { result: { rawTransaction: unrecognizedObject } },
    });
    done();
  }, 100);
});
