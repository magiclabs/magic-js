import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

test.beforeEach(t => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test.serial('Generates JSON RPC request payload with `email` parameter', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(222);

  await magic.auth.loginWithMagicLink({ email: 'test' });

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 222);
  t.is(requestPayload.method, 'magic_auth_login_with_magic_link');
  t.deepEqual(requestPayload.params, [{ email: 'test', showUI: true }]);
});

test.serial('Generates JSON RPC request payload with `showUI` parameter', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(777);

  await magic.auth.loginWithMagicLink({ email: 'test', showUI: false });

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 777);
  t.is(requestPayload.method, 'magic_auth_login_with_magic_link');
  t.deepEqual(requestPayload.params, [{ email: 'test', showUI: false }]);
});
