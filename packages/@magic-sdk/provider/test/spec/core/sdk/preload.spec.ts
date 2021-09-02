import browserEnv from '@ikscodes/browser-env';
import { ViewController } from '../../../../src/core/view-controller';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  (ViewController as any).prototype.waitForReady = jest.fn().mockImplementation(() => Promise.resolve());
});

test('`MagicSDK.preload` awaits `MagicSDK.overlay.ready`', async () => {
  const magic = createMagicSDK();
  magic.preload();
  expect(magic.overlay.waitForReady).toBeCalledTimes(1);
});
