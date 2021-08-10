/* eslint-disable global-require */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
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

test.beforeEach((t) => {
  browserEnv.restore();
  // Silence the "duplicate iframes" warning.
  browserEnv.stub('console.warn', () => {});
});

test.serial('Resolves with a successful response', async (t) => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(Promise.resolve(response));

  const result = await baseModule.request(requestPayload);

  t.is(result, 'hello world');
});

test.serial('Rejects with a `MagicRPCError` upon request failed', async (t) => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyError({ code: -32603, message: 'hello world' });

  postStub.returns(Promise.resolve(response));

  const err: MagicRPCError = await t.throwsAsync(baseModule.request(requestPayload));
  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] hello world');
});

test.serial('Rejects with `MALFORMED_RESPONSE` error if response cannot be parsed correctly', async (t) => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload);

  postStub.returns(Promise.resolve(response));

  const err: MagicSDKError = await t.throwsAsync(baseModule.request(requestPayload));
  t.true(err instanceof MagicSDKError);
  t.is(err.code, 'MALFORMED_RESPONSE');
  t.is(err.message, 'Magic SDK Error: [MALFORMED_RESPONSE] Response from the Magic iframe is malformed.');
});

test.serial('Return value is a `PromiEvent`', async (t) => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(Promise.resolve(response));

  const result = baseModule.request(requestPayload);

  t.true(isPromiEvent(result));
});

test.serial.cb('Emits events received from the `PayloadTransport`', (t) => {
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
    t.is(result, 'world');
    t.end();
  });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: { event: 'hello', params: ['world'] } },
    },
    '*',
  );
});

test.serial('Receive no further events after the response from `PayloadTransport` resolves', async (t) => {
  t.plan(1);

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
      t.is(result, 'world');
    })
    .on('hello2', () => {
      t.fail();
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

test.serial.cb('Falls back to empty array if `params` is missing from event', (t) => {
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
    t.deepEqual(args, []);
    t.end();
  });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: { event: 'hello' } },
    },
    '*',
  );
});

test.serial.cb('Ignores events with malformed response', (t) => {
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
      t.fail();
    })
    .then(() => {
      t.end();
    });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_HANDLE_EVENT,
      response: { id: requestPayload.id, result: undefined },
    },
    '*',
  );
});
