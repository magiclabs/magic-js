import browserEnv from '@ikscodes/browser-env';
import { MAGIC_RELAYER_FULL_URL, ENCODED_QUERY_PARAMS, TEST_API_KEY } from './constants';

export function createReactNativeTransport(endpoint = MAGIC_RELAYER_FULL_URL) {
  const { ReactNativeTransport } = jest.requireActual('../src/react-native-transport');
  return new ReactNativeTransport(endpoint, ENCODED_QUERY_PARAMS);
}

export function createReactNativeWebViewController(endpoint = MAGIC_RELAYER_FULL_URL) {
  const { ReactNativeWebViewController } = jest.requireActual('../src/react-native-webview-controller');
  return new ReactNativeWebViewController(createReactNativeTransport(endpoint));
}

export function createMagicSDK(endpoint = MAGIC_RELAYER_FULL_URL) {
  const { Magic } = jest.requireActual('../src/index.ts');
  browserEnv.stub('console.warn', jest.fn());
  return new Magic(TEST_API_KEY, { endpoint });
}
