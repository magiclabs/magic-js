/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub, mockSDKEnvironmentConstant } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';
import { createMagicSDK } from '../../../factories';

test.beforeEach((t) => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
  mockSDKEnvironmentConstant('platform', 'web');
});

test.serial('Generates JSON RPC request payload with the given parameter as the credential', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(222);

  await magic.auth.loginWithCredential('helloworld');

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 222);
  t.is(requestPayload.method, 'magic_auth_login_with_credential');
  t.deepEqual(requestPayload.params, ['helloworld']);
});

test.serial(
  'If no parameter is given & platform target is "web", URL search string is included in the payload params',
  async (t) => {
    const magic = createMagicSDK();

    const idStub = getPayloadIdStub();
    idStub.returns(777);

    browserEnv.stub('window.history.replaceState', () => {});

    browserEnv.stub('window.location', {
      search: '?magic_credential=asdf',
      origin: 'http://example.com',
      pathname: '/hello/world',
    });

    await magic.auth.loginWithCredential();

    const requestPayload = (magic.user as any).request.args[0][0];
    t.is(requestPayload.jsonrpc, '2.0');
    t.is(requestPayload.id, 777);
    t.is(requestPayload.method, 'magic_auth_login_with_credential');
    t.deepEqual(requestPayload.params, ['?magic_credential=asdf']);
  },
);

test.serial('If no parameter is given & platform target is NOT "web", credential is empty string', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(777);

  mockSDKEnvironmentConstant('platform', 'react-native');

  await magic.auth.loginWithCredential();

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 777);
  t.is(requestPayload.method, 'magic_auth_login_with_credential');
  t.deepEqual(requestPayload.params, ['']);
});
