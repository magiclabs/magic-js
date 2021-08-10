import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { ReactNativeTransport } from '../src/react-native-transport';
import { MAGIC_RELAYER_FULL_URL, ENCODED_QUERY_PARAMS, TEST_API_KEY } from './constants';
import { ReactNativeWebViewController } from '../src/react-native-webview-controller';
import { requireIndex } from './mocks';

export function createReactNativeTransport(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new ReactNativeTransport(endpoint, ENCODED_QUERY_PARAMS);
}

export function createReactNativeWebViewController(endpoint = MAGIC_RELAYER_FULL_URL) {
  return new ReactNativeWebViewController(createReactNativeTransport(endpoint));
}

export function createMagicSDK(endpoint = MAGIC_RELAYER_FULL_URL) {
  const { Magic } = requireIndex();
  browserEnv.stub('console.warn', sinon.stub());
  return new Magic(TEST_API_KEY, { endpoint });
}
