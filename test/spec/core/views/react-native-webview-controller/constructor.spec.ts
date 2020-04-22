/* eslint-disable @typescript-eslint/no-empty-function */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { StyleSheet } from 'react-native';
import { createReactNativeWebViewController } from '../../../../factories';
import { ReactNativeWebViewController } from '../../../../../src/core/views/react-native-webview-controller';
import { PayloadTransport } from '../../../../../src/core/payload-transport';
import { MAGIC_RELAYER_FULL_URL, ENCODED_QUERY_PARAMS } from '../../../../constants';
import { mockConfigConstant } from '../../../../mocks';

test.beforeEach(t => {
  browserEnv.restore();
  mockConfigConstant('IS_REACT_NATIVE', true);
});

test('Instantiates `ReactNativeWebViewController`', async t => {
  const listenStub = sinon.stub();
  const waitForReadyStub = sinon.stub();

  (StyleSheet as any) = { create: sinon.stub().returns({ hello: 'world' }) };

  (ReactNativeWebViewController.prototype as any).listen = listenStub;
  (ReactNativeWebViewController.prototype as any).waitForReady = waitForReadyStub;

  const overlay = createReactNativeWebViewController();

  t.true(overlay instanceof ReactNativeWebViewController);
  t.true((overlay as any).transport instanceof PayloadTransport);
  t.is((overlay as any).endpoint, MAGIC_RELAYER_FULL_URL);
  t.is((overlay as any).encodedQueryParams, ENCODED_QUERY_PARAMS);
  t.is(overlay.webView, null);
  t.is((overlay as any).container, null);
  t.deepEqual((overlay as any).styles, { hello: 'world' });
  t.true(listenStub.calledOnce);
  t.true(waitForReadyStub.calledOnce);
});
