import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { getPayloadIdStub } from '../../../mocks';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
});

test('Generates a JSON RPC request payload with method `eth_accounts`', async () => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.rpcProvider.enable();

  const requestPayload = (magic.user as any).request.args[0][0];
  expect(requestPayload.id).toBe(999);
  expect(requestPayload.method).toBe('eth_accounts');
  expect(requestPayload.params).toEqual([]);
});
