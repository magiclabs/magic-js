/* eslint-disable global-require */

import browserEnv from '@ikscodes/browser-env';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { JsonRpcResponse } from '../../../../src/core/json-rpc';
import { createPayloadTransport, createMagicSDK } from '../../../factories';
import { MagicRPCError, createMalformedResponseError } from '../../../../src/core/sdk-exceptions';
import { isPromiEvent } from '../../../../src/util/promise-tools';
import { MSG_TYPES } from '../../../constants';
import { BaseModule } from '../../../../src/modules/base-module';

function createBaseModule(postStub: jest.Mock) {
  const sdk = createMagicSDK();
  const payloadTransport = createPayloadTransport('');

  (payloadTransport as any).post = postStub;
  Object.defineProperty(sdk, 'transport', {
    get: () => payloadTransport,
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
  const expectedError = new MagicRPCError({ code: -32603, message: 'hello world' });
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

test('Emits events received from the `PayloadTransport`', (done) => {
  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  const { baseModule } = createBaseModule(
    jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(response);
          }, 1000);
        }),
    ),
  );

  baseModule.request(requestPayload).on('hello_a', (result) => {
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

test('Receive no further events after the response from `PayloadTransport` resolves', (done) => {
  expect.assertions(1);

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  const postStubPromises = [];
  const { baseModule } = createBaseModule(
    jest.fn().mockImplementation(() => {
      const promise = new Promise((resolve) => {
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
    .on('hello_b', (result) => {
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

test('Falls back to empty array if `params` is missing from event', (done) => {
  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  const { baseModule } = createBaseModule(
    jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
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

test('Ignores events with malformed response', (done) => {
  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  const { baseModule } = createBaseModule(
    jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
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
