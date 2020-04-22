/* eslint-disable @typescript-eslint/no-empty-function */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createIframeController } from '../../../../factories';
import { IframeController } from '../../../../../src/core/views/iframe-controller';
import { PayloadTransport } from '../../../../../src/core/payload-transport';

test.beforeEach(t => {
  browserEnv.restore();
});

test('Instantiates `IframeController`', async t => {
  const initStub = sinon.stub();
  initStub.returns(new Promise(() => {}));
  const listenStub = sinon.stub();
  const waitForReadyStub = sinon.stub();

  (IframeController.prototype as any).init = initStub;
  (IframeController.prototype as any).listen = listenStub;
  (IframeController.prototype as any).waitForReady = waitForReadyStub;

  const overlay = createIframeController();

  t.true(overlay instanceof IframeController);
  t.true((overlay as any).transport instanceof PayloadTransport);
  t.true(initStub.calledOnce);
  t.true(listenStub.calledOnce);
  t.true(waitForReadyStub.calledOnce);
});
