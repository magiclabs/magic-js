/* eslint-disable global-require */

import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { JsonRpcResponse } from '../../../../src/core/json-rpc';
import { createPayloadTransport, createMagicSDK } from '../../../factories';
import { MagicRPCError, MagicSDKError } from '../../../../src/core/sdk-exceptions';
import { isPromiEvent } from '../../../../src/util/promise-tools';
import { MSG_TYPES } from '../../../constants';
import { BaseModule } from '../../../../src/modules/base-module';

function createBaseModule() {
  const sdk = createMagicSDK();
  const payloadTransport = createPayloadTransport('');
  const postStub = sinon.stub();
  (payloadTransport as any).post = postStub;
  Object.defineProperty(sdk, 'transport', {
    get: () => payloadTransport,
  });

  const baseModule: any = new BaseModule(sdk);

  return { baseModule, postStub };
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
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(Promise.resolve(response));

  const result = await baseModule.request(requestPayload);

  expect(result).toBe('hello world');
});

test('Rejects with a `MagicRPCError` upon request failed', async () => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyError({ code: -32603, message: 'hello world' });

  postStub.returns(Promise.resolve(response));

  const err: MagicRPCError = await t.throwsAsync(baseModule.request(requestPayload));
  expect(err instanceof MagicRPCError).toBe(true);
  expect(err.code).toBe(-32603);
  expect(err.message).toBe('Magic RPC Error: [-32603] hello world');
});

test('Rejects with `MALFORMED_RESPONSE` error if response cannot be parsed correctly', async () => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload);

  postStub.returns(Promise.resolve(response));

  const err: MagicSDKError = await t.throwsAsync(baseModule.request(requestPayload));
  expect(err instanceof MagicSDKError).toBe(true);
  expect(err.code).toBe('MALFORMED_RESPONSE');
  expect(err.message).toBe('Magic SDK Error: [MALFORMED_RESPONSE] Response from the Magic iframe is malformed.');
});

test('Return value is a `PromiEvent`', async () => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(Promise.resolve(response));

  const result = baseModule.request(requestPayload);

  expect(isPromiEvent(result)).toBe(true);
});

test('Emits events received from the `PayloadTransport`', (done) => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, 1000);
    }),
  );

  baseModule.request(requestPayload).on('hello', (result) => {
    expect(result).toBe('world');
    done();
  });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: { event: 'hello', params: ['world'] } },
    },
    '*',
  );
});

test('Receive no further events after the response from `PayloadTransport` resolves', async (done) => {
  expect.assertions(1);

  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, 1000);
    }),
  );

  const request = baseModule
    .request(requestPayload)
    .on('hello', (result) => {
      expect(result).toBe('world');
    })
    .on('hello2', () => {
      done.fail();
    });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: { event: 'hello', params: ['world'] } },
    },
    '*',
  );

  await request;

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: { event: 'hello2' } },
    },
    '*',
  );
});

test('Falls back to empty array if `params` is missing from event', (done) => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, 1000);
    }),
  );

  baseModule.request(requestPayload).on('hello', (...args) => {
    expect(args).toEqual([]);
    done();
  });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: { event: 'hello' } },
    },
    '*',
  );
});

test('Ignores events with malformed response', (done) => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, 1000);
    }),
  );

  baseModule
    .request(requestPayload)
    .on('hello', () => {
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
