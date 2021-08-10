import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test('Generate JSON RPC request payload with method `magic_auth_update_email`', async () => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(333);

  await magic.user.updateEmail({ email: 'test' });

  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.id).toBe(333);
  expect(requestPayload.method).toBe('magic_auth_update_email');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: true }]);
});

test('Accepts a `showUI` parameter', async () => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(888);

  await magic.user.updateEmail({ email: 'test', showUI: false });

  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.id).toBe(888);
  expect(requestPayload.method).toBe('magic_auth_update_email');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: false }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();

  const idStub = getPayloadIdStub();
  idStub.returns(888);

  await magic.user.updateEmail({ email: 'test', showUI: false });

  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(requestPayload.id).toBe(888);
  expect(requestPayload.method).toBe('magic_auth_update_email_testing_mode');
  expect(requestPayload.params).toEqual([{ email: 'test', showUI: false }]);
});
