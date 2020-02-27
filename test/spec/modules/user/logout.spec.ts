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
 * `UserModule.logout`
 *
 * Action Must:
 * - Generate JSON RPC request payload with method `magic_auth_logout`
 */
test('#01', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.user.logout();

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'magic_auth_logout');
  t.deepEqual(requestPayload.params, []);
});
