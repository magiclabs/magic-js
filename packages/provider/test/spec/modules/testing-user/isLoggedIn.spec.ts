import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

const TestModeIsLoginMethod = 'magic_auth_is_logged_in_testing_mode';

test.beforeEach((t) => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test(`Generate JSON RPC request payload with method ${TestModeIsLoginMethod}`, async (t) => {
  const magic = createMagicSDKTestMode();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.user.isLoggedIn();

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, TestModeIsLoginMethod);
  t.deepEqual(requestPayload.params, []);
});
