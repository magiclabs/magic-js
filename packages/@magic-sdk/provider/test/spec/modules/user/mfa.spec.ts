import { createMagicSDK } from '../../../factories';

test('Resolves immediately when cached magic.user.enableMFA.spec is true', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.enableMFA();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow');
  expect(requestPayload.params).toEqual([]);
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.disableMFA();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_disable_mfa_flow');
  expect(requestPayload.params).toEqual([]);
});
