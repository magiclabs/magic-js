import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

test.beforeEach((t) => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test.serial('Generate JSON RPC request payload with method `magic_auth_generate_id_token`', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.user.generateIdToken();

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'magic_auth_generate_id_token');
  t.deepEqual(requestPayload.params, [undefined]);
});

test.serial('Accepts a `lifespan` parameter', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(222);

  magic.user.generateIdToken({ lifespan: 900 });

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 222);
  t.is(requestPayload.method, 'magic_auth_generate_id_token');
  t.deepEqual(requestPayload.params, [{ lifespan: 900 }]);
});

test.serial('Accepts an `attachment` parameter', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(222);

  magic.user.generateIdToken({ attachment: 'hello world' });

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 222);
  t.is(requestPayload.method, 'magic_auth_generate_id_token');
  t.deepEqual(requestPayload.params, [{ attachment: 'hello world' }]);
});

test.serial('If `testMode` is enabled, testing-specific RPC method is used', async (t) => {
  const magic = createMagicSDKTestMode();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.user.generateIdToken();

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'magic_auth_generate_id_token_testing_mode');
  t.deepEqual(requestPayload.params, [undefined]);
});
