/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';

test.beforeEach((t) => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test.serial('Generates JSON RPC request payload with `email` parameter', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(222);

  await magic.auth.loginWithMagicLink({ email: 'test' });

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 222);
  t.is(requestPayload.method, 'magic_auth_login_with_magic_link');
  t.deepEqual(requestPayload.params, [{ email: 'test', showUI: true, redirectURI: undefined }]);
});

test.serial('Generates JSON RPC request payload with `showUI` parameter', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(777);

  await magic.auth.loginWithMagicLink({ email: 'test', showUI: false });

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 777);
  t.is(requestPayload.method, 'magic_auth_login_with_magic_link');
  t.deepEqual(requestPayload.params, [{ email: 'test', showUI: false, redirectURI: undefined }]);
});

test.serial('Generates JSON RPC request payload with `redirectURI` parameter', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  await magic.auth.loginWithMagicLink({ email: 'test', showUI: true, redirectURI: 'helloworld' });

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'magic_auth_login_with_magic_link');
  t.deepEqual(requestPayload.params, [{ email: 'test', showUI: true, redirectURI: 'helloworld' }]);
});

test.serial('If `testMode` is enabled, testing-specific RPC method is used', async (t) => {
  const magic = createMagicSDKTestMode();

  const idStub = getPayloadIdStub();
  idStub.returns(456);

  await magic.auth.loginWithMagicLink({ email: 'test' });

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 456);
  t.is(requestPayload.method, 'magic_login_with_magic_link_testing_mode');
  t.deepEqual(requestPayload.params, [{ email: 'test', showUI: true, redirectURI: undefined }]);
});
