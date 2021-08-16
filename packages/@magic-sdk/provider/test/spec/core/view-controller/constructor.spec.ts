/* eslint-disable @typescript-eslint/no-empty-function */

import browserEnv from '@ikscodes/browser-env';
import { ViewController } from '../../../../src/core/view-controller';
import { createViewController } from '../../../factories';
import { PayloadTransport } from '../../../../src/core/payload-transport';

beforeEach(() => {
  browserEnv.restore();
});

test('Instantiates `ViewController`', async () => {
  const initStub = jest.fn().mockImplementation(() => new Promise(() => {}));
  const listenStub = jest.fn();
  const waitForReadyStub = jest.fn();

  (ViewController.prototype as any).init = initStub;
  (ViewController.prototype as any).listen = listenStub;
  (ViewController.prototype as any).waitForReady = waitForReadyStub;

  const overlay = createViewController();

  expect(overlay instanceof ViewController).toBe(true);
  expect((overlay as any).transport instanceof PayloadTransport).toBe(true);
  expect((overlay as any).endpoint).toBe((overlay as any).transport.endpoint);
  expect((overlay as any).parameters).toBe((overlay as any).transport.parameters);
  expect(initStub).toBeCalledTimes(1);
  expect(listenStub).toBeCalledTimes(1);
  expect(waitForReadyStub).toBeCalledTimes(1);
});
