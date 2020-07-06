/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub, transformNewAssertionForServerStub } from '../../../mocks';
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
    await magic.auth.registerWithWebAuthn({ username: 'testUsername', nickname: 'test nickname' });
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
    await magic.auth.registerWithWebAuthn({ username: 'testUsername', nickname: 'test nickname' });
  } catch (e) {
    t.is(
      e.message,
      'Magic SDK Error: [WEBAUTHN_CREATE_CREDENTIAL_ERROR] Error creating credential: ' +
        "TypeError: Cannot read property 'create' of undefined",
    );
  }
});

test.serial('Test register with webauthn success', async (t) => {
  const MockNickname = 'test';
  const MockUsername = 'testUserName';
  const MockTransports = ['usb'];
  const MockUserAgent = 'chrome';
  const MockRegistrationResponse = 'test registration_response';

  browserEnv.stub('window.PublicKeyCredential', true);
  browserEnv.stub('navigator.credentials', {
    create: async () => ({
      response: {
        getTransports: () => MockTransports,
      },
    }),
  });
  browserEnv.stub('navigator.userAgent', MockUserAgent);
  (BaseModule as any).prototype.request.returns({
    options: { credential_options: {} },
  });

  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(333);
  const registrationResponseStub = transformNewAssertionForServerStub();
  registrationResponseStub.returns(MockRegistrationResponse);

  await magic.auth.registerWithWebAuthn({ username: MockUsername, nickname: MockNickname });

  const requestPayloadRegisterStart = (magic.auth as any).request.args[0][0];
  t.is(requestPayloadRegisterStart.id, 333);
  t.is(requestPayloadRegisterStart.method, 'magic_auth_webauthn_registration_start');
  t.deepEqual(requestPayloadRegisterStart.params, [{ username: MockUsername }]);

  const requestPayloadRegister = (magic.auth as any).request.args[1][0];
  t.is(requestPayloadRegister.method, 'magic_auth_webauthn_register');
  t.is(requestPayloadRegister.id, 333);
  t.deepEqual(requestPayloadRegister.params, [
    {
      id: undefined,
      nickname: MockNickname,
      transport: MockTransports,
      user_agent: MockUserAgent,
      registration_response: MockRegistrationResponse,
    },
  ]);
});

test.serial('Test register with webauthn success without nickname', async (t) => {
  const MockNickname = 'test';
  const MockUsername = 'testUserName';
  const MockTransports = ['usb'];
  const MockUserAgent = 'chrome';
  const MockRegistrationResponse = 'test registration_response';

  browserEnv.stub('window.PublicKeyCredential', true);
  browserEnv.stub('navigator.credentials', {
    create: async () => ({
      response: {
        getTransports: () => MockTransports,
      },
    }),
  });
  browserEnv.stub('navigator.userAgent', MockUserAgent);
  (BaseModule as any).prototype.request.returns({
    options: { credential_options: {} },
  });

  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(333);
  const registrationResponseStub = transformNewAssertionForServerStub();
  registrationResponseStub.returns(MockRegistrationResponse);

  await magic.auth.registerWithWebAuthn({ username: MockUsername });

  const requestPayloadRegisterStart = (magic.auth as any).request.args[0][0];
  t.is(requestPayloadRegisterStart.id, 333);
  t.is(requestPayloadRegisterStart.method, 'magic_auth_webauthn_registration_start');
  t.deepEqual(requestPayloadRegisterStart.params, [{ username: MockUsername }]);

  const requestPayloadRegister = (magic.auth as any).request.args[1][0];
  t.is(requestPayloadRegister.method, 'magic_auth_webauthn_register');
  t.is(requestPayloadRegister.id, 333);
  t.deepEqual(requestPayloadRegister.params, [
    {
      id: undefined,
      nickname: '',
      transport: MockTransports,
      user_agent: MockUserAgent,
      registration_response: MockRegistrationResponse,
    },
  ]);
});
