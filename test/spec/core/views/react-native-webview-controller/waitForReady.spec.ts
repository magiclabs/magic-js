import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import test from 'ava';
import { StyleSheet } from 'react-native';
import { createReactNativeWebViewController } from '../../../../factories';
import { MSG_TYPES, ENCODED_QUERY_PARAMS } from '../../../../constants';
import { mockConfigConstant } from '../../../../mocks';

test.beforeEach(t => {
  browserEnv();
  mockConfigConstant('IS_REACT_NATIVE', true);
  (StyleSheet as any) = { create: sinon.stub() };
});

test.cb('Receive MAGIC_OVERLAY_READY, resolve `waitForReady` promise', t => {
  const overlay = createReactNativeWebViewController('asdf');
  const waitForReady = (overlay as any).waitForReady();

  waitForReady.then(() => {
    t.end();
  });

  (overlay as any).transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: MSG_TYPES().MAGIC_OVERLAY_READY }),
    },
  });
});
