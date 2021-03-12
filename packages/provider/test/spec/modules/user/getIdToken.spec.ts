import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

const TestModeGetIdTokenMethod = 'magic_auth_get_id_token_testing_mode';

test.beforeEach((t) => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test.serial(`Generate JSON RPC request payload with method ${TestModeGetIdTokenMethod}`, async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.user.getIdToken();

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, TestModeGetIdTokenMethod);
  t.deepEqual(requestPayload.params, [undefined]);
});

test.serial('Accepts a `lifespan` parameter', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(222);

  magic.user.getIdToken({ lifespan: 900 });

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 222);
  t.is(requestPayload.method, TestModeGetIdTokenMethod);
  t.deepEqual(requestPayload.params, [{ lifespan: 900 }]);
});
