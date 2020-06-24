/* eslint-disable prefer-spread */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { MagicIncomingWindowMessage, MagicOutgoingWindowMessage, JsonRpcRequestPayload } from '@magic-sdk/types';
import { PayloadTransport } from '../../../../src/core/payload-transport';
import { createPayloadTransport } from '../../../factories';
import { JsonRpcResponse } from '../../../../src/core/json-rpc';
import { ViewController } from '../../../../src/core/view-controller';

/**
 * Stub `IframeController` for `PayloadTransport` testing requirements.
 */
function overlayStub(hasContentWindow = true): ViewController {
  const stub = {
    ready: Promise.resolve(),
    postMessage: sinon.stub(),
  } as any;

  Object.setPrototypeOf(stub, ViewController.prototype);

  return stub;
}

/**
 * Create a dummy request payload.
 */
function requestPayload(id = 1): JsonRpcRequestPayload {
  return {
    id,
    jsonrpc: '2.0',
    method: 'eth_accounts',
    params: [],
  };
}

/**
 * Create a dummy response payload.
 */
function responseEvent(values: { result?: any; error?: any; id?: number } = {}) {
  return {
    data: {
      response: {
        result: values.result ?? null,
        error: values.error ?? null,
        jsonrpc: '2.0',
        id: values.id ?? 1,
      },
    },
  };
}

/**
 * Stub the `PayloadTransport.on` method (hide implementation, only test
 * `PayloadTransport.post` logic).
 */
function stubPayloadTransport(transport: PayloadTransport, events: [MagicIncomingWindowMessage, any][]) {
  const timeouts = [];
  const handlerSpy = sinon.spy(() => timeouts.forEach((t) => t && clearTimeout(t)));
  const onSpy = sinon.spy((msgType, handler) => {
    events.forEach((event, i) => {
      if (msgType === event[0]) {
        timeouts.push(setTimeout(() => handler(event[1]), 1000 * (i + 1)));
      }
    });
    return handlerSpy;
  });

  /* eslint-disable-next-line no-param-reassign */
  (transport as any).on = onSpy;

  return { handlerSpy, onSpy };
}

test.beforeEach((t) => {
  browserEnv();
  browserEnv.stub('addEventListener', sinon.stub());
});

test.serial('Sends payload; recieves MAGIC_HANDLE_REQUEST event; resolves response', async (t) => {
  const transport = createPayloadTransport('asdf');
  const { handlerSpy, onSpy } = stubPayloadTransport(transport, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const overlay = overlayStub();
  const payload = requestPayload();

  const response = await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  t.is(onSpy.args[0][0], MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  t.true(handlerSpy.calledOnce);
  t.deepEqual(response, new JsonRpcResponse(responseEvent().data.response));
});

test.serial(
  'Sends payload; recieves MAGIC_HANDLE_REQUEST event; skips payloads with non-matching ID; resolves response',
  async (t) => {
    const transport = createPayloadTransport('asdf');
    const { handlerSpy, onSpy } = stubPayloadTransport(transport, [
      [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent({ id: 1234 })], // Should be skipped
      [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
    ]);
    const overlay = overlayStub();
    const payload = requestPayload();

    const response = await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

    t.is(onSpy.args[0][0], MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
    t.true(handlerSpy.calledOnce);
    t.deepEqual(response, new JsonRpcResponse(responseEvent().data.response));
  },
);

test.serial('Sends payload and standardizes malformed response', async (t) => {
  const transport = createPayloadTransport('asdf');
  const overlay = overlayStub();
  const payload = requestPayload();

  stubPayloadTransport(transport, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, { data: { response: undefined } }],
  ]);

  transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  t.true(true);
});

test.serial('Sends a batch payload and resolves with multiple responses', async (t) => {
  const response1 = responseEvent({ result: 'one', id: 1 });
  const response2 = responseEvent({ result: 'two', id: 2 });
  const response3 = responseEvent({ result: 'three', id: 3 });

  const transport = createPayloadTransport('asdf');
  const { handlerSpy, onSpy } = stubPayloadTransport(transport, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, response1],
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, response2],
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, response3],
  ]);
  const overlay = overlayStub();

  const payload1 = requestPayload(1);
  const payload2 = requestPayload(2);
  const payload3 = requestPayload(3);

  const response = await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, [
    payload1,
    payload2,
    payload3,
  ]);

  t.is(onSpy.args[0][0], MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  t.true(handlerSpy.calledOnce);
  t.deepEqual(response, [
    new JsonRpcResponse(response1.data.response),
    new JsonRpcResponse(response2.data.response),
    new JsonRpcResponse(response3.data.response),
  ]);
});
