import { SubtensorExtension } from '../../src/index';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';

beforeEach(() => {
  jest.resetAllMocks();
});

function makeMagic() {
  const magic = createMagicSDKWithExtension({}, [
    new SubtensorExtension({ rpcUrl: 'wss://entrypoint-finney.opentensor.ai:443' }),
  ]);
  magic.subtensor.request = jest.fn();
  return magic;
}

test('extension reports name and chain type', () => {
  const ext = new SubtensorExtension({ rpcUrl: 'wss://example' });
  expect(ext.name).toBe('subtensor');
});

test('getAccount sends subtensor_getAccount with empty params', () => {
  const magic = makeMagic();
  magic.subtensor.getAccount();
  const payload = (magic.subtensor.request as jest.Mock).mock.calls[0][0];
  expect(payload.method).toBe('subtensor_getAccount');
  expect(payload.params).toEqual([]);
});

test('sendTransaction forwards { to, amount }', () => {
  const magic = makeMagic();
  magic.subtensor.sendTransaction({ to: '5Dest', amount: '1000000000' });
  const payload = (magic.subtensor.request as jest.Mock).mock.calls[0][0];
  expect(payload.method).toBe('subtensor_sendTransaction');
  expect(payload.params).toEqual({ to: '5Dest', amount: '1000000000' });
});

test('addProxy forwards delegate + optional proxyType/delay', () => {
  const magic = makeMagic();
  magic.subtensor.addProxy({ delegate: '5Del', proxyType: 'Staking', delay: 5 });
  const payload = (magic.subtensor.request as jest.Mock).mock.calls[0][0];
  expect(payload.method).toBe('subtensor_addProxy');
  expect(payload.params).toEqual({ delegate: '5Del', proxyType: 'Staking', delay: 5 });
});

test('addStake forwards hotkey, amount, and optional netuid', () => {
  const magic = makeMagic();
  magic.subtensor.addStake({ hotkey: '5Hot', amount: BigInt(100), netuid: 7 });
  const payload = (magic.subtensor.request as jest.Mock).mock.calls[0][0];
  expect(payload.method).toBe('subtensor_addStake');
  expect(payload.params).toEqual({ hotkey: '5Hot', amount: BigInt(100), netuid: 7 });
});

test('removeStake forwards hotkey + amount', () => {
  const magic = makeMagic();
  magic.subtensor.removeStake({ hotkey: '5Hot', amount: '50' });
  const payload = (magic.subtensor.request as jest.Mock).mock.calls[0][0];
  expect(payload.method).toBe('subtensor_removeStake');
  expect(payload.params).toEqual({ hotkey: '5Hot', amount: '50' });
});

test('moveStake forwards origin/dest hotkeys and amount', () => {
  const magic = makeMagic();
  magic.subtensor.moveStake({
    originHotkey: '5From',
    destHotkey: '5To',
    amount: BigInt(200),
    originNetuid: 1,
    destNetuid: 2,
  });
  const payload = (magic.subtensor.request as jest.Mock).mock.calls[0][0];
  expect(payload.method).toBe('subtensor_moveStake');
  expect(payload.params).toEqual({
    originHotkey: '5From',
    destHotkey: '5To',
    amount: BigInt(200),
    originNetuid: 1,
    destNetuid: 2,
  });
});

test('signRaw forwards arbitrary payload as params', () => {
  const magic = makeMagic();
  magic.subtensor.signRaw({ method: '0xdeadbeef', version: 4 });
  const payload = (magic.subtensor.request as jest.Mock).mock.calls[0][0];
  expect(payload.method).toBe('subtensor_signRaw');
  expect(payload.params).toEqual({ method: '0xdeadbeef', version: 4 });
});
