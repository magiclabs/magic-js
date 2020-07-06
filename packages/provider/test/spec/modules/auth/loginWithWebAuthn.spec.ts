/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub, transformAssertionForServerStub } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';
import { createMagicSDK } from '../../../factories';

test.beforeEach((t) => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test.serial('Test throw Magic SDK Error: WEBAUTHN_NOT_SUPPORTED', async (t) => {
  browserEnv.stub('window.PublicKeyCredential', false);

  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(333);

  try {
    await magic.auth.loginWithWebAuthn({ username: 'testUsername' });
  } catch (e) {
    t.is(e.message, 'Magic SDK Error: [WEBAUTHN_NOT_SUPPORTED] WebAuthn is not supported in this device.');
  }
});

test.serial('Test throw Magic SDK Error: WEBAUTHN_CREATE_CREDENTIAL_ERROR', async (t) => {
  browserEnv.stub('window.PublicKeyCredential', true);
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(333);

  try {
    await magic.auth.loginWithWebAuthn({ username: 'testUsername' });
  } catch (e) {
    t.is(
      e.message,
      'Magic SDK Error: [WEBAUTHN_CREATE_CREDENTIAL_ERROR] Error creating credential: ' +
        "TypeError: Cannot read property 'get' of undefined",
    );
  }
});

test.serial('Test login webauthn success', async (t) => {
  const MockAssertion = {};
  const MockUsername = 'test';

  browserEnv.stub('window.PublicKeyCredential', true);
  browserEnv.stub('navigator.credentials', {
    get: async () => {},
  });

  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(333);
  const assertionStub = transformAssertionForServerStub();
  assertionStub.returns(MockAssertion);

  await magic.auth.loginWithWebAuthn({ username: MockUsername });

  const requestPayloadLogin = (magic.auth as any).request.args[0][0];
  t.is(requestPayloadLogin.id, 333);
  t.is(requestPayloadLogin.method, 'magic_auth_login_with_web_authn');
  t.deepEqual(requestPayloadLogin.params, [{ username: MockUsername }]);

  const requestPayloadLoginVerify = (magic.auth as any).request.args[1][0];
  t.is(requestPayloadLoginVerify.method, 'magic_auth_login_with_webauthn_verify');
  t.is(requestPayloadLoginVerify.id, 333);
  t.deepEqual(requestPayloadLoginVerify.params, [
    {
      username: MockUsername,
      assertion_response: MockAssertion,
    },
  ]);
});
