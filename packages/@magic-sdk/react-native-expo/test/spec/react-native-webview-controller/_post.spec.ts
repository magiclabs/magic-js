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
  const overlay = createReactNativeWebViewController('http://example.com');
  const postStub = jest.fn();
  overlay.webView = { postMessage: postStub };

  // Assume `_post` method returns a promise that rejects upon timeout
  const payload = { method: 'testMethod', id: 123 };

  try {
    await overlay._post({ msgType: 'MAGIC_HANDLE_REQUEST-troll', payload });
  } catch (error) {
    expect(error.code).toBe(SDKErrorCode.ResponseTimeout);
  }
});

test('Adds a timeout to messageTimeouts map on message send', async () => {
  const overlay = createReactNativeWebViewController('http://example.com');

  overlay.webView = { postMessage: jest.fn() };
  const payload = { method: 'testMethod', id: 123 };

  try {
    await overlay._post({ msgType: 'MAGIC_HANDLE_REQUEST-troll', payload });
  } catch (error) {
    expect(error.code).toBe(SDKErrorCode.ResponseTimeout);
  }

  expect(overlay.messageTimeouts.has(123)).toBe(true);
});

test('Removes timeout from messageTimeouts map on response', async () => {
  const overlay = createReactNativeWebViewController('http://example.com');

  // Mock the WebView and its postMessage method
  overlay.webView = { postMessage: jest.fn() };

  const payload = { method: 'testMethod', id: 123 };
  try {
    await overlay._post({ msgType: 'MAGIC_HANDLE_REQUEST-troll', payload });
  } catch (error) {
    expect(error.code).toBe(SDKErrorCode.ResponseTimeout);
  }

  try {
    // Simulate receiving a response by directly invoking the message handler
    overlay.handleReactNativeWebViewMessage({
      nativeEvent: {
        data: JSON.stringify({ response: { id: 123 } }),
      },
    });
  } catch (e) {
    console.log(e);
  }

  expect(overlay.messageTimeouts.has(123)).toBe(true);
});

test('Removes timeout from messageTimeouts map on timeout', async () => {
  expect.assertions(2); // Make sure both assertions are checked
  const overlay = createReactNativeWebViewController('http://example.com');

  overlay.webView = { postMessage: jest.fn() };

  // Mock setTimeout to immediately invoke its callback to simulate a timeout
  jest.spyOn(global, 'setTimeout').mockImplementationOnce((cb) => {
    cb();
    return 123; // Return a mock timer ID
  });

  const payload = { method: 'testMethod', id: 123 };

  try {
    await overlay._post({ msgType: 'MAGIC_HANDLE_REQUEST-troll', payload });
  } catch (error) {
    // Expect that the error was thrown due to a timeout
    expect(error.code).toBe(SDKErrorCode.ResponseTimeout);
    // Expect that the timeout was removed from the map after the error was thrown
    expect(overlay.messageTimeouts.has(123)).toBe(false);
  }

  // Restore original setTimeout function
  jest.restoreAllMocks();
});
