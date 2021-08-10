/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { BaseModule } from '../../../../src/modules/base-module';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test('Generates JSON RPC request payload with `email` parameter', async () => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(222);

  await magic.auth.loginWithMagicLink({ email: 'test' });

  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.id).toBe(222);
  expect(requestPayload.method).toBe('magic_auth_login_with_magic_link');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true, redirectURI: undefined }]);
});

test('Generates JSON RPC request payload with `showUI` parameter', async () => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(777);

  await magic.auth.loginWithMagicLink({ email: 'test', showUI: false });

  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.id).toBe(777);
  expect(requestPayload.method).toBe('magic_auth_login_with_magic_link');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: false, redirectURI: undefined }]);
});

test('Generates JSON RPC request payload with `redirectURI` parameter', async () => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  await magic.auth.loginWithMagicLink({ email: 'test', showUI: true, redirectURI: 'helloworld' });

  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.id).toBe(999);
  expect(requestPayload.method).toBe('magic_auth_login_with_magic_link');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true, redirectURI: 'helloworld' }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();

  const idStub = getPayloadIdStub();
  idStub.returns(456);

  await magic.auth.loginWithMagicLink({ email: 'test' });

  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.id).toBe(456);
  expect(requestPayload.method).toBe('magic_login_with_magic_link_testing_mode');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true, redirectURI: undefined }]);
});
