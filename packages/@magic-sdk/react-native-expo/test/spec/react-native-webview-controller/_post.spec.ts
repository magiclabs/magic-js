import browserEnv from '@ikscodes/browser-env';
import { createModalNotReadyError, createResponseTimeoutError } from '@magic-sdk/provider';
import { SDKErrorCode } from '@magic-sdk/types';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';

beforeEach(() => {
  browserEnv.restore();
  reactNativeStyleSheetStub();
});

test('Calls webView._post with the expected arguments', async () => {
  const overlay = createReactNativeWebViewController('http://example.com');

  const postStub = jest.fn();
  overlay.webView = { postMessage: postStub };

  await overlay._post({ thisIsData: 'hello world' });

  expect(postStub.mock.calls[0]).toEqual([JSON.stringify({ thisIsData: 'hello world' }), 'http://example.com']);
});

test('Throws MODAL_NOT_READY error if webView is nil', async () => {
  const overlay = createReactNativeWebViewController();

  overlay.webView = undefined;

  const expectedError = createModalNotReadyError();

  expect(() => overlay._post({ thisIsData: 'hello world' })).rejects.toThrow(expectedError);
});

test('Process Typed Array in a Solana Request', async () => {
  const overlay = createReactNativeWebViewController('http://example.com');

  const postStub = jest.fn();
  overlay.webView = { postMessage: postStub };

  await overlay._post({
    msgType: 'MAGIC_HANDLE_REQUEST-troll',
    payload: {
      id: 3,
      jsonrpc: '2.0',
      method: 'sol_signMessage',
      params: { message: new Uint8Array([72, 101, 108, 108, 111]) },
    },
  });

  expect(postStub.mock.calls[0]).toEqual([
    '{"msgType":"MAGIC_HANDLE_REQUEST-troll","payload":{"id":3,"jsonrpc":"2.0","method":"sol_signMessage","params":{"message":{"constructor":"Uint8Array","data":"72,101,108,108,111","flag":"MAGIC_PAYLOAD_FLAG_TYPED_ARRAY"}}}}',
    'http://example.com',
  ]);
});

test('Throws RESPONSE_TIMEOUT error if response takes longer than 10 seconds', async () => {
  jest.useFakeTimers();
  jest.spyOn(global, 'setTimeout');

  const overlay = createReactNativeWebViewController('http://example.com');

  const postStub = jest.fn();
  overlay.webView = { postMessage: postStub };

  // Setup expected payload
  const payload = { method: 'testMethod', id: 123 };

  const promise = overlay._post({ msgType: 'MAGIC_HANDLE_REQUEST-troll', payload });

  // Fast-forward time by 10 seconds
  jest.advanceTimersByTime(10000);

  // Assert that the promise rejects with the expected error
  await expect(promise).rejects.toEqual(
    expect.objectContaining({
      code: SDKErrorCode.ResponseTimeout,
      message: expect.stringContaining('Response timed out for method: testMethod with message id: 123'),
    }),
  );

  jest.useRealTimers();
});
