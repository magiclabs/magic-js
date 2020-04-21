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

test.serial('Generate JSON RPC request payload with method `magic_auth_update_email`', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(333);

  await magic.user.updateEmail({ email: 'test' });

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 333);
  t.is(requestPayload.method, 'magic_auth_update_email');
  t.deepEqual(requestPayload.params, [{ email: 'test', showUI: true }]);
});

test.serial('Accepts a `showUI` parameter', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(888);

  await magic.user.updateEmail({ email: 'test', showUI: false });

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.jsonrpc, '2.0');
  t.is(requestPayload.id, 888);
  t.is(requestPayload.method, 'magic_auth_update_email');
  t.deepEqual(requestPayload.params, [{ email: 'test', showUI: false }]);
});
