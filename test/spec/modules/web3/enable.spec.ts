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
 * `Web3Module.enable`
 *
 * Action Must:
 * - Generate JSON RPC request payload with method `eth_accounts`
 */
test('#01', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.web3.enable();

  const requestPayload = (magic.user as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'eth_accounts');
  t.deepEqual(requestPayload.params, []);
});
