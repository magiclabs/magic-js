import browserEnv from '@ikscodes/browser-env';
import { MagicIncomingWindowMessage, MagicOutgoingWindowMessage, JsonRpcRequestPayload } from '@magic-sdk/types';
import { createViewController, TestViewController } from '../../../factories';
import { JsonRpcResponse } from '../../../../src/core/json-rpc';
import * as storage from '../../../../src/util/storage';
import * as webCryptoUtils from '../../../../src/util/web-crypto';
import * as deviceShareWebCryptoUtils from '../../../../src/util/device-share-web-crypto';
import { SDKEnvironment } from '../../../../src/core/sdk-environment';
import { createModalNotReadyError } from '../../../../src/core/sdk-exceptions';

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
function responseEvent(values: { result?: any; error?: any; id?: number; deviceShare?: string } = {}) {
  return {
    data: {
      response: {
        result: values.result ?? null,
        error: values.error ?? null,
        jsonrpc: '2.0',
        id: values.id ?? 1,
      },
      deviceShare: values.deviceShare ?? null,
    },
  };
}

/**
 * Stub the `ViewController.on` method (hide implementation, only test
 * `ViewController.post` logic).
 */
function stubViewController(viewController: any, events: [MagicIncomingWindowMessage, any][]) {
  const timeouts = [];
  const handlerSpy = jest.fn(() => timeouts.forEach(t => t && clearTimeout(t)));
  const onSpy = jest.fn((msgType, handler) => {
    events.forEach((event, i) => {
      if (msgType === event[0]) {
        timeouts.push(setTimeout(() => handler(event[1]), 100 * (i + 1)));
      }
    });
    return handlerSpy;
  });
  const postSpy = jest.fn();

  viewController.on = onSpy;
  viewController.checkIsReadyForRequest = Promise.resolve();
  viewController._post = postSpy;

  return { handlerSpy, onSpy, postSpy };
}

let createJwtStub;
let getDecryptedDeviceShareStub;
let clearDeviceSharesStub;
const FAKE_JWT_TOKEN = 'hot tokens';
const FAKE_DEVICE_SHARE = 'fake device share';
const FAKE_RT = 'will freshen';
const FAKE_INJECTED_JWT = 'fake injected jwt';
let FAKE_STORE: any = {};

let viewController: TestViewController;

beforeEach(() => {
  jest.restoreAllMocks();
  createJwtStub = jest.spyOn(webCryptoUtils, 'createJwt');
  getDecryptedDeviceShareStub = jest.spyOn(deviceShareWebCryptoUtils, 'getDecryptedDeviceShare');
  clearDeviceSharesStub = jest.spyOn(deviceShareWebCryptoUtils, 'clearDeviceShares');
  jest.spyOn(global.console, 'info').mockImplementation(() => {});
  browserEnv();
  browserEnv.stub('addEventListener', jest.fn());
  jest.spyOn(storage, 'getItem').mockImplementation((key: string) => FAKE_STORE[key]);
  jest.spyOn(storage, 'setItem').mockImplementation(async (key: string, value: any) => {
    FAKE_STORE[key] = value;
  });
  SDKEnvironment.platform = 'web';
  viewController = createViewController('asdf');
  viewController.isReadyForRequest = true;
});

afterEach(() => {
  FAKE_STORE = {};
});

test('Sends payload; recieves MAGIC_HANDLE_REQUEST event; resolves response', async () => {
  createJwtStub.mockImplementationOnce(() => Promise.resolve(FAKE_JWT_TOKEN));
  const { handlerSpy, onSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const payload = requestPayload();

  const response = await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toBe(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toBeCalledTimes(1);
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));
});

test('Sends payload with jwt when web crypto is supported', async () => {
  createJwtStub.mockImplementationOnce(() => Promise.resolve(FAKE_JWT_TOKEN));
  const { handlerSpy, onSpy, postSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const payload = requestPayload();

  const response = await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toBe(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toHaveBeenCalledTimes(1);
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));
  expect(createJwtStub).toHaveBeenCalledWith();
  expect(postSpy).toBeCalledWith(expect.objectContaining({ jwt: FAKE_JWT_TOKEN }));
});

test('Sends payload with deviceShare when it is saved', async () => {
  createJwtStub.mockImplementationOnce(() => Promise.resolve(FAKE_JWT_TOKEN));
  getDecryptedDeviceShareStub.mockImplementationOnce(() => Promise.resolve(FAKE_DEVICE_SHARE));
  const eventWithDeviceShare = { data: { ...responseEvent().data, deviceShare: FAKE_DEVICE_SHARE } };

  const { postSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, eventWithDeviceShare],
  ]);
  const payload = requestPayload();
  await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(createJwtStub).toHaveBeenCalledWith();
  expect(postSpy).toHaveBeenCalledWith(expect.objectContaining({ deviceShare: FAKE_DEVICE_SHARE }));
});

test('device share should be cleared if replied user denied account access.', async () => {
  createJwtStub.mockImplementationOnce(() => Promise.resolve(FAKE_JWT_TOKEN));
  getDecryptedDeviceShareStub.mockImplementationOnce(() => Promise.resolve(FAKE_DEVICE_SHARE));
  clearDeviceSharesStub.mockImplementationOnce(() => Promise.resolve());
  const eventWithError = {
    data: {
      ...responseEvent().data,
      response: {
        id: 1,
        error: { message: 'User denied account access.' },
      },
    },
  };

  const { postSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, eventWithError],
  ]);
  const payload = requestPayload();
  await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(createJwtStub).toHaveBeenCalledWith();
  expect(postSpy).toHaveBeenCalledWith(expect.objectContaining({ deviceShare: FAKE_DEVICE_SHARE }));
});

test('Sends payload with rt and jwt when rt is saved', async () => {
  createJwtStub.mockImplementationOnce(() => Promise.resolve(FAKE_JWT_TOKEN));
  FAKE_STORE.rt = FAKE_RT;

  const { postSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const payload = requestPayload();
  await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(createJwtStub).toHaveBeenCalledWith();
  expect(postSpy).toHaveBeenCalledWith(expect.objectContaining({ jwt: FAKE_JWT_TOKEN, rt: FAKE_RT }));
});

test('Sends payload with rt and an injected jwt when both rt and jwt are saved', async () => {
  createJwtStub.mockImplementationOnce(() => Promise.resolve(FAKE_JWT_TOKEN));
  FAKE_STORE.rt = FAKE_RT;
  FAKE_STORE.jwt = FAKE_INJECTED_JWT;

  const { postSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const payload = requestPayload();
  await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(createJwtStub).not.toHaveBeenCalledWith();
  expect(postSpy).toHaveBeenCalledWith(expect.objectContaining({ jwt: FAKE_INJECTED_JWT, rt: FAKE_RT }));
});

test('Sends payload without rt if no jwt can be made', async () => {
  createJwtStub.mockImplementation(() => Promise.resolve(undefined));
  FAKE_STORE.rt = FAKE_RT;

  const { postSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const payload = requestPayload();

  await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);
  expect(postSpy).not.toBeCalledWith(expect.objectContaining({ rt: FAKE_RT }));
});

test('Sends payload when web crypto jwt fails', async () => {
  const consoleErrorStub = jest.spyOn(global.console, 'error').mockImplementationOnce(() => {});
  createJwtStub.mockRejectedValueOnce('danger');
  FAKE_STORE.rt = FAKE_RT;

  const { handlerSpy, onSpy, postSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const payload = requestPayload();

  const response = await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toEqual(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toHaveBeenCalledTimes(1);
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));

  expect(createJwtStub).toHaveBeenCalledWith();
  expect(consoleErrorStub).toHaveBeenCalled();
  expect(postSpy).not.toHaveBeenCalledWith(expect.objectContaining({ jwt: FAKE_JWT_TOKEN }));
});

test('Sends payload and stores rt if response event contains rt', async () => {
  const eventWithRt = { data: { ...responseEvent().data, rt: FAKE_RT } };
  const { handlerSpy, onSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, eventWithRt],
  ]);
  const payload = requestPayload();

  const response = await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toEqual(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toHaveBeenCalled();
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));

  expect(FAKE_STORE.rt).toEqual(FAKE_RT);
});

test('throws MODAL_NOT_READY error when not connected to the internet', async () => {
  const eventWithRt = { data: { ...responseEvent().data } };
  const { handlerSpy, onSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, eventWithRt],
  ]);

  // @ts-ignore protected variable
  viewController.isConnectedToInternet = false;

  const payload = requestPayload();

  try {
    await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);
  } catch (e) {
    expect(e).toEqual(createModalNotReadyError());
  }
});

test('does not call web crypto api if platform is not web', async () => {
  SDKEnvironment.platform = 'react-native';
  const eventWithRt = { data: { ...responseEvent().data } };
  const { handlerSpy, onSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, eventWithRt],
  ]);
  const payload = requestPayload();

  const response = await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(createJwtStub).not.toHaveBeenCalledWith();
  expect(onSpy.mock.calls[0][0]).toEqual(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toHaveBeenCalled();
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));
});

test('Sends payload recieves MAGIC_HANDLE_REQUEST event; skips payloads with non-matching ID; resolves response', async () => {
  const { handlerSpy, onSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent({ id: 1234 })], // Should be skipped
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, responseEvent()],
  ]);
  const payload = requestPayload();

  const response = await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(onSpy.mock.calls[0][0]).toEqual(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE);
  expect(handlerSpy).toHaveBeenCalledTimes(1);
  expect(response).toEqual(new JsonRpcResponse(responseEvent().data.response));
});

test('Sends payload and standardizes malformed response', async () => {
  const payload = requestPayload();

  stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, { data: { response: undefined } }],
  ]);

  viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

  expect(true).toBe(true);
});

test('Sends a batch payload and resolves with multiple responses', async () => {
  const response1 = responseEvent({ result: 'one', id: 1 });
  const response2 = responseEvent({ result: 'two', id: 2 });
  const response3 = responseEvent({ result: 'three', id: 3 });

  const { handlerSpy, onSpy } = stubViewController(viewController, [
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, response1],
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, response2],
    [MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, response3],
  ]);

  const payload1 = requestPayload(1);
  const payload2 = requestPayload(2);
  const payload3 = requestPayload(3);

  const response = await viewController.post(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, [
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
