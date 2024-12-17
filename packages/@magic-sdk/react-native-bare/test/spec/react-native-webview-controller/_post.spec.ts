import { createModalNotReadyError } from '@magic-sdk/provider';
import { createReactNativeWebViewController } from '../../factories';
import { reactNativeStyleSheetStub } from '../../mocks';
import { ReactNativeWebViewController } from '../../../src/react-native-webview-controller';
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(() => {
  jest.resetAllMocks();
  reactNativeStyleSheetStub();
});

const emitStub = jest.fn();

jest.mock('react-native-event-listeners', () => {
  return {
    EventRegister: {
      emit: (...args: unknown[]) => emitStub(...args),
      addEventListener: jest.fn(),
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

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

test('Emits msg_posted_after_inactivity_event when msgPostedAfterInactivity returns true', async () => {
  const overlay = createReactNativeWebViewController('http://example.com');

  overlay.msgPostedAfterInactivity = () => true;
  await overlay._post({ thisIsData: 'hello world' });

  expect(emitStub).toHaveBeenCalledTimes(1);
  expect(emitStub).toHaveBeenCalledWith('msg_posted_after_inactivity_event', { thisIsData: 'hello world' });
});

test('returns true when more than 5 minutes have passed since the last post', async () => {
  const controller = createReactNativeWebViewController('http://example.com');

  const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(sixMinutesAgo);
  const result = await (controller as any).msgPostedAfterInactivity();
  expect(result).toBe(true);
  expect(AsyncStorage.getItem).toHaveBeenCalledWith('lastMessageTime');
})