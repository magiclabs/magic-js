import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { RPCProviderModule } from '../../../../src/modules/rpc-provider';
import { createSynchronousWeb3MethodWarning } from '../../../../src/core/sdk-exceptions';

beforeEach(() => {
  browserEnv.restore();
  (RPCProviderModule as any).prototype.request = jest.fn();
  (RPCProviderModule as any).prototype.sendAsync = jest.fn();
});

test('Async, with payload method (as string); uses fallback `params` argument', async () => {
  const magic = createMagicSDK();

  magic.rpcProvider.send('eth_call');

  const requestPayload = magic.rpcProvider.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('eth_call');
  expect(requestPayload.params).toEqual([]);
});

test('Async, with payload method (as string); uses given `params` argument', async () => {
  const magic = createMagicSDK();

  magic.rpcProvider.send('eth_call', ['hello world']);

  const requestPayload = magic.rpcProvider.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('eth_call');
  expect(requestPayload.params).toEqual(['hello world']);
});

test('Async, with full RPC payload + callback', async () => {
  const magic = createMagicSDK();

  const onRequestComplete = () => {};
  magic.rpcProvider.send({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] }, onRequestComplete);

  const requestPayload = magic.rpcProvider.sendAsync.mock.calls[0][0];
  const expectedCallback = magic.rpcProvider.sendAsync.mock.calls[0][1];
  expect(requestPayload.id).toBe(1);
  expect(requestPayload.method).toBe('eth_call');
  expect(requestPayload.params).toEqual(['hello world']);
  expect(onRequestComplete).toBe(expectedCallback);
});

test('Async, with batch RPC payload + callback', async () => {
  const magic = createMagicSDK();

  const onRequestComplete = () => {};
  const payload1 = { jsonrpc: '2.0', id: 1, method: 'first', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'second', params: ['goodbye world'] };
  magic.rpcProvider.send([payload1, payload2], onRequestComplete);

  const requestPayload = magic.rpcProvider.sendAsync.mock.calls[0][0];
  const expectedCallback = magic.rpcProvider.sendAsync.mock.calls[0][1];
  expect(requestPayload[0].id).toBe(1);
  expect(requestPayload[0].method).toBe('first');
  expect(requestPayload[0].params).toEqual(['hello world']);
  expect(requestPayload[1].id).toBe(2);
  expect(requestPayload[1].method).toBe('second');
  expect(requestPayload[1].params).toEqual(['goodbye world']);
  expect(onRequestComplete).toBe(expectedCallback);
});

test('Sync (legacy behavior), with full RPC payload and no callback', async () => {
  const magic = createMagicSDK();

  const consoleWarnStub = jest.fn();
  browserEnv.stub('console.warn', consoleWarnStub);

  const result = magic.rpcProvider.send({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] });
  const expectedWarning = createSynchronousWeb3MethodWarning();

  expect(result.jsonrpc).toBe('2.0');
  expect(result.id).toBe(1);
  expect(result.error.code).toBe(-32603);
  expect(result.error.message).toBe(expectedWarning.rawMessage);
  expect(consoleWarnStub).toBeCalledWith(expectedWarning.message);
});
