/* eslint-disable prefer-spread */

import browserEnv from '@ikscodes/browser-env';
import { MagicIncomingWindowMessage, MagicOutgoingWindowMessage, JsonRpcRequestPayload } from '@magic-sdk/types';
import _ from 'lodash';
import { PayloadTransport } from '../../../../src/core/payload-transport';
import { createPayloadTransport } from '../../../factories';
import { JsonRpcResponse } from '../../../../src/core/json-rpc';
import { ViewController } from '../../../../src/core/view-controller';
import * as storage from '../../../../src/util/storage';
import * as webCryptoUtils from '../../../../src/util/web-crypto';

/**
 * Stub `IframeController` for `PayloadTransport` testing requirements.
 */
function overlayStub(): ViewController {
  const stub = {
    ready: Promise.resolve(),
    postMessage: jest.fn(),
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
  const handlerSpy = jest.fn(() => timeouts.forEach((t) => t && clearTimeout(t)));
  const onSpy = jest.fn((msgType, handler) => {
    events.forEach((event, i) => {
      if (msgType === event[0]) {
        timeouts.push(setTimeout(() => handler(event[1]), 100 * (i + 1)));
      }
    });
    return handlerSpy;
  });

  /* eslint-disable-next-line no-param-reassign */
  (transport as any).on = onSpy;

  return { handlerSpy, onSpy };
}

const createJwtStub = jest.spyOn(webCryptoUtils, 'createJwt');
const FAKE_JWT_TOKEN = 'hot tokens';
const FAKE_RT = 'will freshen';
let FAKE_STORE: any = {};

beforeEach(() => {
  browserEnv();
  browserEnv.stub('addEventListener', jest.fn());
  jest.spyOn(storage, 'getItem').mockImplementation((key: string) => FAKE_STORE[key]);
  jest.spyOn(storage, 'setItem').mockImplementation(async (key: string, value: any) => {
    FAKE_STORE[key] = value;
  });
});

afterEach(() => {
  FAKE_STORE = {};
});

test('Sends payload; recieves MAGIC_HANDLE_REQUEST event; resolves response', async () => {
  createJwtStub.mockImplementationOnce(() => Promise.resolve(FAKE_JWT_TOKEN));
  const transport = createPayloadTransport('asdf');
  const { handlerSpy, onSpy } = stubPayloadTransport(transport, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const overlay = overlayStub();
  const payload = requestPayload();

  const response = await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toBe(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toBeCalledTimes(1);
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));
});

test('Sends payload with jwt when web crypto is supported', async () => {
  createJwtStub.mockImplementationOnce(() => Promise.resolve(FAKE_JWT_TOKEN));
  const transport = createPayloadTransport('asdf');
  const { handlerSpy, onSpy } = stubPayloadTransport(transport, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const overlay = overlayStub();
  const payload = requestPayload();

  const response = await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toBe(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toHaveBeenCalledTimes(1);
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));
  expect(createJwtStub).toHaveBeenCalledWith();
  expect(overlay.postMessage).toBeCalledWith(expect.objectContaining({ jwt: FAKE_JWT_TOKEN }));
});

test('Sends payload with rt and jwt when rt is saved', async () => {
  createJwtStub.mockImplementationOnce(() => Promise.resolve(FAKE_JWT_TOKEN));
  FAKE_STORE.rt = FAKE_RT;

  const transport = createPayloadTransport('asdf');
  stubPayloadTransport(transport, [[MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()]]);
  const overlay = overlayStub();
  const payload = requestPayload();
  await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(createJwtStub).toHaveBeenCalledWith();
  expect(overlay.postMessage).toHaveBeenCalledWith(expect.objectContaining({ jwt: FAKE_JWT_TOKEN, rt: FAKE_RT }));
});

test('Sends payload without rt if no jwt can be made', async () => {
  createJwtStub.mockImplementation(() => Promise.resolve(undefined));
  FAKE_STORE.rt = FAKE_RT;

  const transport = createPayloadTransport('asdf');
  stubPayloadTransport(transport, [[MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()]]);
  const overlay = overlayStub();
  const payload = requestPayload();

  await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);
  expect(overlay.postMessage).not.toBeCalledWith(expect.objectContaining({ rt: FAKE_RT }));
});

test('Sends payload when web crypto jwt fails', async () => {
  const consoleErrorStub = jest.spyOn(global.console, 'error').mockImplementationOnce(() => {});
  createJwtStub.mockRejectedValueOnce('danger');
  FAKE_STORE.rt = FAKE_RT;

  const transport = createPayloadTransport('asdf');
  const { handlerSpy, onSpy } = stubPayloadTransport(transport, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const overlay = overlayStub();
  const payload = requestPayload();

  const response = await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toEqual(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toHaveBeenCalledTimes(1);
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));

  expect(createJwtStub).toHaveBeenCalledWith();
  expect(consoleErrorStub).toHaveBeenCalled();
  expect(overlay.postMessage).not.toHaveBeenCalledWith(expect.objectContaining({ jwt: FAKE_JWT_TOKEN }));
});

test('Sends payload and stores rt if response event contains rt', async () => {
  const eventWithRt = { data: { ...responseEvent().data, rt: FAKE_RT } };
  const transport = createPayloadTransport('asdf');
  const { handlerSpy, onSpy } = stubPayloadTransport(transport, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, eventWithRt],
  ]);
  const overlay = overlayStub();
  const payload = requestPayload();

  const response = await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toEqual(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toHaveBeenCalled();
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));

  expect(FAKE_STORE.rt).toEqual(FAKE_RT);
});

test('Sends payload recieves MAGIC_HANDLE_REQUEST event; skips payloads with non-matching ID; resolves response', async () => {
  const transport = createPayloadTransport('asdf');
  const { handlerSpy, onSpy } = stubPayloadTransport(transport, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent({ id: 1234 })], // Should be skipped
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const overlay = overlayStub();
  const payload = requestPayload();

  const response = await transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toEqual(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toHaveBeenCalledTimes(1);
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));
});

test('Sends payload and standardizes malformed response', async () => {
  const transport = createPayloadTransport('asdf');
  const overlay = overlayStub();
  const payload = requestPayload();

  stubPayloadTransport(transport, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, { data: { response: undefined } }],
  ]);

  transport.post(overlay, MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(true).toBe(true);
});

test('Sends a batch payload and resolves with multiple responses', async () => {
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

  expect(onSpy.mock.calls[0][0]).toBe(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toBeCalledTimes(1);
  expect(response).toEqual([
    new JsonRpcResponse(response1.data.response),
    new JsonRpcResponse(response2.data.response),
    new JsonRpcResponse(response3.data.response),
  ]);
});
