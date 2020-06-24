/* eslint-disable @typescript-eslint/no-empty-function */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { ViewController } from '../../../../src/core/view-controller';
import { createViewController } from '../../../factories';
import { PayloadTransport } from '../../../../src/core/payload-transport';

test.beforeEach((t) => {
  browserEnv.restore();
});

test('Instantiates `ViewController`', async (t) => {
  const initStub = sinon.stub();
  initStub.returns(new Promise(() => {}));
  const listenStub = sinon.stub();
  const waitForReadyStub = sinon.stub();

  (ViewController.prototype as any).init = initStub;
  (ViewController.prototype as any).listen = listenStub;
  (ViewController.prototype as any).waitForReady = waitForReadyStub;

  const overlay = createViewController();

  t.true(overlay instanceof ViewController);
  t.true((overlay as any).transport instanceof PayloadTransport);
  t.true(initStub.calledOnce);
  t.true(listenStub.calledOnce);
  t.true(waitForReadyStub.calledOnce);
});
