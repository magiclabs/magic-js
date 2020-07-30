import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

test.beforeEach((t) => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test.serial('Generate JSON RPC request payload with method `magic_user_update_webauthn`', async (t) => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(333);

  await magic.user.updateWebAuthnInfo({ id: '1', nickname: 'test' });

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 333);
  t.is(requestPayload.method, 'magic_user_update_webauthn');
  t.deepEqual(requestPayload.params, [
    {
      webAuthnCredentialsId: '1',
      nickname: 'test',
    },
  ]);
});
