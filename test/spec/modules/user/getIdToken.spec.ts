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

/**
 * `UserModule.getIdToken`
 *
 * Action Must:
 * - Generate JSON RPC request payload with method `magic_auth_get_id_token`
 */
test.serial('#01', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.user.getIdToken();

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'magic_auth_get_id_token');
  t.deepEqual(requestPayload.params, [undefined]);
});

/**
 * `UserModule.getIdToken`
 *
 * Action Must:
 * - Generate JSON RPC request payload with method `magic_auth_get_id_token`
 */
test.serial('#02', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(222);

  magic.user.getIdToken({ lifespan: 900 });

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 222);
  t.is(requestPayload.method, 'magic_auth_get_id_token');
  t.deepEqual(requestPayload.params, [{ lifespan: 900 }]);
});
