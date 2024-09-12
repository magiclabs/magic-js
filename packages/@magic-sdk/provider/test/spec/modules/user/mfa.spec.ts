import { createMagicSDK } from '../../../factories';

test('Resolves immediately when cached magic.user.enableMFA.spec is true with ShowUI: true', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.enableMFA({ showUI: true });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow');
  expect(requestPayload.params).toEqual([{ showUI: true }]);
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true with ShowUI: false', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.enableMFA({ showUI: false });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow');
  expect(requestPayload.params).toEqual([{ showUI: false }]);
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true with empty param', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await magic.user.enableMFA({});

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_enable_mfa_flow');
  expect(requestPayload.params).toEqual([{ showUI: true }]);
});

test('Resolves immediately when cached magic.user.enableMFA.spec is true', () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.disableMFA();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_disable_mfa_flow');
  expect(requestPayload.params).toEqual([]);
});
