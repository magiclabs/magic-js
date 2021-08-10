/* eslint-disable @typescript-eslint/no-empty-function */

import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { ViewController } from '../../../../src/core/view-controller';
import { createViewController } from '../../../factories';
import { PayloadTransport } from '../../../../src/core/payload-transport';

beforeEach(() => {
  browserEnv.restore();
});

test('Instantiates `ViewController`', async () => {
  const initStub = sinon.stub();
  initStub.returns(new Promise(() => {}));
  const listenStub = sinon.stub();
  const waitForReadyStub = sinon.stub();

  (ViewController.prototype as any).init = initStub;
  (ViewController.prototype as any).listen = listenStub;
  (ViewController.prototype as any).waitForReady = waitForReadyStub;

  const overlay = createViewController();

  expect(overlay instanceof ViewController).toBe(true);
  expect((overlay as any).transport instanceof PayloadTransport).toBe(true);
  expect((overlay as any).endpoint).toBe((overlay as any).transport.endpoint);
  expect((overlay as any).parameters).toBe((overlay as any).transport.parameters);
  expect(initStub.calledOnce).toBe(true);
  expect(listenStub.calledOnce).toBe(true);
  expect(waitForReadyStub.calledOnce).toBe(true);
});
