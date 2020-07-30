import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { getPayloadIdStub, transformNewAssertionForServerStub } from '../../../mocks';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

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
    await magic.user.registerWebAuthnDevice('test');
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
    await magic.user.registerWebAuthnDevice('test');
  } catch (e) {
    t.is(
      e.message,
      'Magic SDK Error: [WEBAUTHN_CREATE_CREDENTIAL_ERROR] Error creating credential: ' +
        "TypeError: Cannot read property 'create' of undefined",
    );
  }
});

test.serial('Test register WebAuthn Device success', async (t) => {
  const MockNickname = 'test';
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

  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(333);
  const registrationResponseStub = transformNewAssertionForServerStub();
  registrationResponseStub.returns(MockRegistrationResponse);
  (BaseModule as any).prototype.request.returns({
    options: { credential_options: {} },
  });

  await magic.user.registerWebAuthnDevice(MockNickname);

  const requestPayloadRegisterStart = (magic.user as any).request.args[0][0];
  t.is(requestPayloadRegisterStart.id, 333);
  t.is(requestPayloadRegisterStart.method, 'magic_auth_register_webauthn_device_start');
  t.deepEqual(requestPayloadRegisterStart.params, []);

  const requestPayloadRegister = (magic.user as any).request.args[1][0];
  t.is(requestPayloadRegister.method, 'magic_auth_register_webauthn_device');
  t.is(requestPayloadRegister.id, 333);
  t.deepEqual(requestPayloadRegister.params, [
    {
      nickname: MockNickname,
      transport: MockTransports,
      user_agent: MockUserAgent,
      registration_response: MockRegistrationResponse,
    },
  ]);
});

test.serial('Test register WebAuthn Device success without nickname', async (t) => {
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

  await magic.user.registerWebAuthnDevice();

  const requestPayloadRegisterStart = (magic.user as any).request.args[0][0];
  t.is(requestPayloadRegisterStart.id, 333);
  t.is(requestPayloadRegisterStart.method, 'magic_auth_register_webauthn_device_start');
  t.deepEqual(requestPayloadRegisterStart.params, []);

  const requestPayloadRegister = (magic.user as any).request.args[1][0];
  t.is(requestPayloadRegister.method, 'magic_auth_register_webauthn_device');
  t.is(requestPayloadRegister.id, 333);
  t.deepEqual(requestPayloadRegister.params, [
    {
      nickname: '',
      transport: MockTransports,
      user_agent: MockUserAgent,
      registration_response: MockRegistrationResponse,
    },
  ]);
});
