import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `mc_request_user_info`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.requestInfoWithUI();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_request_user_info');
  expect(requestPayload.params).toEqual([]);
});

test('Accepts a `scope` parameter', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.requestInfoWithUI({ scope: { email: 'required' } });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_request_user_info');
  expect(requestPayload.params).toEqual([{ scope: { email: 'required' } }]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.requestInfoWithUI())).toBeTruthy();
});
