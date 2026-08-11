import { ENCODED_QUERY_PARAMS } from '../../constants';
import { createReactNativeWebViewController } from '../../factories';

jest.mock('../../../src/native-crypto/dpop', () => ({
  getDpop: jest.fn().mockImplementation(() => Promise.resolve(null)),
  deleteDpop: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
}));

beforeEach(() => {
  jest.resetAllMocks();
  const { deleteDpop, getDpop } = require('../../../src/native-crypto/dpop');
  deleteDpop.mockImplementation(() => Promise.resolve(undefined));
  getDpop.mockImplementation(() => Promise.resolve(null));
});

const TROLL_GOAT = 'https://troll-goat.magic.link';
const NOT_TROLL_GOAT = 'https://not-troll-goat.magic.link';

test('Ignores events with different origin than expected', done => {
  const viewController = createReactNativeWebViewController(TROLL_GOAT);
  const onHandlerStub = jest.fn();
  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `${NOT_TROLL_GOAT}/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: '{}',
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 100);
});

test('Ignores events with non-string data', done => {
  const viewController = createReactNativeWebViewController(TROLL_GOAT);
  const onHandlerStub = jest.fn();
  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `${NOT_TROLL_GOAT}/send/?params=${viewController.parameters}`,
      data: 123,
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).not.toBeCalled();
    done();
  }, 100);
});

test('Replaces `undefined` or `null` response with an empty object', done => {
  const viewController = createReactNativeWebViewController(TROLL_GOAT);
  const onHandlerStub = jest.fn();
  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `${TROLL_GOAT}/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}` }),
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).toBeCalledTimes(1);
    expect(onHandlerStub.mock.calls[0][0].data).toEqual({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    done();
  }, 100);
});

test('Executes event handlers where `messageHandlers` size is > 0', done => {
  const viewController = createReactNativeWebViewController(TROLL_GOAT);
  const onHandlerStub = jest.fn();
  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `${TROLL_GOAT}/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} }),
    },
  } as any);

  setTimeout(() => {
    expect(onHandlerStub).toBeCalledTimes(1);
    expect(onHandlerStub.mock.calls[0][0].data).toEqual({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} });
    done();
  }, 100);
});

test('Ignores event handlers where `messageHandlers` size is === 0', done => {
  const viewController = createReactNativeWebViewController(TROLL_GOAT);
  viewController.messageHandlers = { size: 0 };

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `${TROLL_GOAT}/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: `asdf-${ENCODED_QUERY_PARAMS}`, response: {} }),
    },
  } as any);

  setTimeout(() => {
    done();
  }, 100);
});

test('Process Typed Array in Solana Payload', done => {
  const viewController = createReactNativeWebViewController(TROLL_GOAT);
  const onHandlerStub = jest.fn();

  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `${TROLL_GOAT}/send/?params=${ENCODED_QUERY_PARAMS}`,
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

test('Process Typed Array in Solana Payload', done => {
  const viewController = createReactNativeWebViewController(TROLL_GOAT);
  const onHandlerStub = jest.fn();

  viewController.messageHandlers.add(onHandlerStub);

  const unrecognizedObject = {
    constructor: 'Uint8Array',
    data: ['21,0,0,0'],
    flag: 'MAGIC_PAYLOAD_FLAG_TYPED_ARRAY',
  };

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `${TROLL_GOAT}/send/?params=${ENCODED_QUERY_PARAMS}`,
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

test('Calls deleteDpop when response error code is DpopInvalidated', done => {
  const { deleteDpop } = require('../../../src/native-crypto/dpop');
  const viewController = createReactNativeWebViewController(TROLL_GOAT);
  const onHandlerStub = jest.fn();
  viewController.messageHandlers.add(onHandlerStub);

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `${TROLL_GOAT}/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({
        msgType: `asdf-${ENCODED_QUERY_PARAMS}`,
        response: { error: { code: -10019 } },
      }),
    },
  } as any);

  setTimeout(() => {
    expect(deleteDpop).toHaveBeenCalledTimes(1);
    done();
  }, 100);
});

test('Swallows deleteDpop rejection when response error code is DpopInvalidated', done => {
  const { deleteDpop } = require('../../../src/native-crypto/dpop');
  deleteDpop.mockImplementation(() => Promise.reject(new Error('keychain error')));

  const viewController = createReactNativeWebViewController(TROLL_GOAT);
  viewController.messageHandlers.add(jest.fn());

  viewController.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `${TROLL_GOAT}/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({
        msgType: `asdf-${ENCODED_QUERY_PARAMS}`,
        response: { error: { code: -10019 } },
      }),
    },
  } as any);

  // The rejection is caught internally — the promise must not propagate
  setTimeout(() => {
    expect(deleteDpop).toHaveBeenCalledTimes(1);
    done();
  }, 100);
});
