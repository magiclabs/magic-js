import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../lib/stubs';
import { createMagicSDK } from '../../../lib/factories';
import { BaseModule } from '../../../../src/modules/base-module';

test.beforeEach(t => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

/**
 * `UserModule.generateIdToken`
 *
 * Action Must:
 * - Generate JSON RPC request payload with method `magic_auth_generate_id_token`
 */
test.serial('#01', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.user.getIdToken();

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'magic_auth_generate_id_token');
  t.deepEqual(requestPayload.params, [undefined]);
});

/**
 * `UserModule.generateIdToken` with `lifespan` configuration.
 *
 * Action Must:
 * - Generate JSON RPC request payload with method `magic_auth_generate_id_token`
 */
test.serial('#02', async t => {
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

/**
 * `UserModule.generateIdToken` with `attachment` configuration.
 *
 * Action Must:
 * - Generate JSON RPC request payload with method `magic_auth_generate_id_token`
 */
test.serial('#03', async t => {
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
