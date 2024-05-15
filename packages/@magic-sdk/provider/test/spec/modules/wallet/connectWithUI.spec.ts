import browserEnv from '@ikscodes/browser-env';
import { ConnectWithUiEvents } from '@magic-sdk/types';
import { createPromiEvent } from '../../../../src/util';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `mc_login` and `env` params as an object', async () => {
  const magic = createMagicSDK();
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>(async (resolve, reject) => {
    resolve(['0x12345']);
  });
  magic.wallet.request = jest.fn(() => mockPromiEvent);
  const handle = magic.wallet.connectWithUI();
  mockPromiEvent.emit('id-token-created', { idToken: '1234456' });
  await handle;
  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_login');
});
