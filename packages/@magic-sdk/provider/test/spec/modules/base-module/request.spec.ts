import browserEnv from '@ikscodes/browser-env';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { JsonRpcResponse } from '../../../../src/core/json-rpc';
import { createViewController, createMagicSDK } from '../../../factories';
import { MagicRPCError, createMalformedResponseError } from '../../../../src/core/sdk-exceptions';
import { isPromiEvent } from '../../../../src/util/promise-tools';
import { MSG_TYPES } from '../../../constants';
import { BaseModule } from '../../../../src/modules/base-module';

function createBaseModule(postStub: jest.Mock) {
  const sdk = createMagicSDK();
  const viewController = createViewController('');

  viewController.post = postStub;
  Object.defineProperty(sdk, 'overlay', {
    get: () => viewController,
  });

  const baseModule: any = new BaseModule(sdk);

  return { baseModule };
}

const requestPayload: JsonRpcRequestPayload = {
  jsonrpc: '2.0',
  id: 1,
  params: [],
  method: 'test',
};

beforeEach(() => {
  browserEnv.restore();
  // Silence the "duplicate iframes" warning.
  browserEnv.stub('console.warn', () => {});
});

test('Resolves with a successful response', async () => {
  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');
  const { baseModule } = createBaseModule(jest.fn().mockImplementation(() => Promise.resolve(response)));
  const result = await baseModule.request(requestPayload);
  expect(result).toBe('hello world');
});

test('Rejects with a `MagicRPCError` upon request failed', async () => {
  const response = new JsonRpcResponse(requestPayload).applyError({ code: -32603, message: 'hello world' });
  const { baseModule } = createBaseModule(jest.fn().mockImplementation(() => Promise.resolve(response)));
  const expectedError = new MagicRPCError({
    code: -32603,
    message: 'hello world',
    data: '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011555345525f554e52454749535445524544000000000000000000000000000000',
  });
  await expect(() => baseModule.request(requestPayload)).rejects.toThrow(expectedError);
});

test('Rejects with `MALFORMED_RESPONSE` error if response cannot be parsed correctly', async () => {
  const response = new JsonRpcResponse(requestPayload);
  const { baseModule } = createBaseModule(jest.fn().mockImplementation(() => Promise.resolve(response)));
  const expectedError = createMalformedResponseError();
  await expect(() => baseModule.request(requestPayload)).rejects.toThrow(expectedError);
});

test('Return value is a `PromiEvent`', async () => {
  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');
  const { baseModule } = createBaseModule(jest.fn().mockImplementation(() => Promise.resolve(response)));
  const result = baseModule.request(requestPayload);
  expect(isPromiEvent(result)).toBe(true);
});

test('Emits events received from the `ViewController`', done => {
  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  const { baseModule } = createBaseModule(
    jest.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(response);
          }, 1000);
        }),
    ),
  );

  baseModule.request(requestPayload).on('hello_a', result => {
    expect(result).toBe('world');
    done();
  });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: { event: 'hello_a', params: ['world'] } },
    },
    '*',
  );
});

test('Receive no further events after the response from `ViewController` resolves', done => {
  expect.assertions(1);

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  const postStubPromises = [];
  const { baseModule } = createBaseModule(
    jest.fn().mockImplementation(() => {
      const promise = new Promise(resolve => {
        setTimeout(() => {
          resolve(response);
        }, 100);
      });
      postStubPromises.push(promise);
      return promise;
    }),
  );

  const request = baseModule
    .request(requestPayload)
    .on('hello_b', result => {
      expect(result).toBe('world');
    })
    .on('hello_b2', () => {
      done.fail();
    });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: { event: 'hello_b', params: ['world'] } },
    },
    '*',
  );

  request.then(() => {
    window.postMessage(
      {
        msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
        response: { id: requestPayload.id, result: { event: 'hello_b2' } },
      },
      '*',
    );

    Promise.all(postStubPromises).then(() => {
      setTimeout(() => {
        done();
      }, 100);
    });
  });
});

test('Falls back to empty array if `params` is missing from event', done => {
  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  const { baseModule } = createBaseModule(
    jest.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(response);
          }, 1000);
        }),
    ),
  );

  baseModule.request(requestPayload).on('hello_c', (...args) => {
    expect(args).toEqual([]);
    done();
  });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: { event: 'hello_c' } },
    },
    '*',
  );
});

test('Ignores events with malformed response', done => {
  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  const { baseModule } = createBaseModule(
    jest.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(response);
          }, 1000);
        }),
    ),
  );

  baseModule
    .request(requestPayload)
    .on('hello_d', () => {
      done.fail();
    })
    .then(() => {
      done();
    });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: undefined },
    },
    '*',
  );
});

test('Resolves with an intermediary event', async () => {
  const expectedResult = 'monkey brains';
  const expectedPayload = [
    'MAGIC_HANDLE_REQUEST',
    {
      id: (requestPayload.id as number) + 1,
      jsonrpc: requestPayload.jsonrpc,
      method: 'magic_intermediary_event',
      params: [
        {
          args: undefined,
          eventType: 'event',
          payloadId: requestPayload.id,
        },
      ],
    },
  ];
  const response = new JsonRpcResponse(requestPayload).applyResult(expectedResult);
  const mock = jest.fn().mockImplementation(() => Promise.resolve(response));
  const { baseModule } = createBaseModule(mock);
  const intermediaryEventFunc = baseModule.createIntermediaryEvent('event', requestPayload.id);
  intermediaryEventFunc();
  expect(mock.mock.calls[0]).toEqual(expectedPayload);
});

test('Resolves with an intermediary event with one matching args', async () => {
  const expectedResult = 'monkey brains';
  const expectedPayload = [
    'MAGIC_HANDLE_REQUEST',
    {
      id: 3,
      jsonrpc: requestPayload.jsonrpc,
      method: 'magic_intermediary_event',
      params: [
        {
          args: expectedResult,
          eventType: 'event',
          payloadId: requestPayload.id,
        },
      ],
    },
  ];
  const response = new JsonRpcResponse(requestPayload).applyResult(expectedResult);
  const mock = jest.fn().mockImplementation(() => Promise.resolve(response));
  const { baseModule } = createBaseModule(mock);
  const intermediaryEventFunc = baseModule.createIntermediaryEvent('event', requestPayload.id);
  intermediaryEventFunc(expectedResult);
  expect(mock.mock.calls[0]).toEqual(expectedPayload);
});

test('Resolves with an intermediary event with two matching args', async () => {
  const expectedResult = 'monkey brains';
  const expectedPayload = [
    'MAGIC_HANDLE_REQUEST',
    {
      id: 4,
      jsonrpc: requestPayload.jsonrpc,
      method: 'magic_intermediary_event',
      params: [
        {
          args: [expectedResult, 5],
          eventType: 'event',
          payloadId: requestPayload.id,
        },
      ],
    },
  ];
  const response = new JsonRpcResponse(requestPayload).applyResult(expectedResult);
  const mock = jest.fn().mockImplementation(() => Promise.resolve(response));
  const { baseModule } = createBaseModule(mock);
  const intermediaryEventFunc = baseModule.createIntermediaryEvent('event', requestPayload.id);
  intermediaryEventFunc([expectedResult, 5]);
  expect(mock.mock.calls[0]).toEqual(expectedPayload);
});

test('Resolves with an intermediary event with null args', async () => {
  const expectedResult = 'monkey brains';
  const expectedPayload = [
    'MAGIC_HANDLE_REQUEST',
    {
      id: 5,
      jsonrpc: requestPayload.jsonrpc,
      method: 'magic_intermediary_event',
      params: [
        {
          args: null,
          eventType: 'event',
          payloadId: requestPayload.id,
        },
      ],
    },
  ];
  const response = new JsonRpcResponse(requestPayload).applyResult(expectedResult);
  const mock = jest.fn().mockImplementation(() => Promise.resolve(response));
  const { baseModule } = createBaseModule(mock);
  const intermediaryEventFunc = baseModule.createIntermediaryEvent('event', requestPayload.id);
  intermediaryEventFunc(null);
  expect(mock.mock.calls[0]).toEqual(expectedPayload);
});
