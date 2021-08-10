import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test('Generate JSON RPC request payload with method `magic_auth_get_id_token`', async () => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.user.getIdToken();

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.id).toBe(999);
  expect(requestPayload.method).toBe('magic_auth_get_id_token');
  expect(requestPayload.params).toEqual([undefined]);
});

test('Accepts a `lifespan` parameter', async () => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(222);

  magic.user.getIdToken({ lifespan: 900 });

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.id).toBe(222);
  expect(requestPayload.method).toBe('magic_auth_get_id_token');
  expect(requestPayload.params).toEqual([{ lifespan: 900 }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.user.getIdToken();

  /* Assertion */
  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.id).toBe(999);
  expect(requestPayload.method).toBe('magic_auth_get_id_token_testing_mode');
  expect(requestPayload.params).toEqual([undefined]);
});
