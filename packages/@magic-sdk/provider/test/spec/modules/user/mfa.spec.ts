import { mockLocalForage } from '../../../mocks';
import { createMagicSDK } from '../../../factories';

test('Resolves immediately when cached magic.user.enableMFA.spec is true', async () => {
  const magic = createMagicSDK();

  const enableMFA = magic.user.enableMFA();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow');
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true', async () => {
  const magic = createMagicSDK();

  const disableMFA = magic.user.disableMFA();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_disable_mfa_flow');
});
