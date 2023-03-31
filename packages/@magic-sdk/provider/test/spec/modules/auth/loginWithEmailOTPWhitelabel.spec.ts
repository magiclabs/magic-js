import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

const expectedEmail = 'john.doe@mail.com';

test('Generates JSON RPC pending for otp-input-sent', async () => {
  const magic = createMagicSDK();
  magic.auth.overlay.post = jest.fn();
  const createIntermediaryEventFn = jest.fn();
  magic.auth.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);

  const handle = magic.auth.loginWithEmailOTP({ email: expectedEmail, showUI: false });

  const troll_otp = '123456';
  handle.emit('verify-email-otp', troll_otp);
  handle.emit('cancel');

  const verifyEvent = magic.auth.createIntermediaryEvent.mock.calls[0];
  expect(verifyEvent[0]).toBe('verify-email-otp');
  expect(createIntermediaryEventFn.mock.calls[0][0]).toBe(troll_otp);

  const intermediaryEventSecondMethod = magic.auth.createIntermediaryEvent.mock.calls[1][0];
  expect(intermediaryEventSecondMethod).toBe('cancel');
});
