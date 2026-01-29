import { MagicOutgoingWindowMessage } from '@magic-sdk/types';
import { createViewController } from '../../../factories';
import { ENCODED_QUERY_PARAMS } from '../../../constants';

const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const INITIAL_HEARTBEAT_DELAY = 60 * 60 * 1000; // 1 hour

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

test('stopHeartBeat clears heartbeat interval and invokes debounced callback', () => {
  const viewController = createViewController('');
  viewController.reloadRelayer = jest.fn().mockResolvedValue(undefined);
  viewController._post = jest.fn().mockResolvedValue(undefined);

  viewController.stopHeartBeat();
  expect((viewController as any).heartbeatIntervalTimer).toBeNull();
  expect((viewController as any).lastPongTime).toBeNull();
});

test('heartBeatCheck runs after debounce delay and sends ping on interval', async () => {
  const viewController = createViewController('');
  viewController.reloadRelayer = jest.fn().mockResolvedValue(undefined);
  viewController._post = jest.fn().mockResolvedValue(undefined);

  viewController.stopHeartBeat();
  jest.advanceTimersByTime(INITIAL_HEARTBEAT_DELAY);

  await Promise.resolve();
  expect((viewController as any).heartbeatIntervalTimer).not.toBeNull();

  jest.advanceTimersByTime(PING_INTERVAL);
  await Promise.resolve();
  expect(viewController._post).toHaveBeenCalledWith({
    msgType: `${MagicOutgoingWindowMessage.MAGIC_PING}-${ENCODED_QUERY_PARAMS}`,
    payload: [],
  });
});

test('heartBeatCheck reloads relayer when no pong received on second interval tick', async () => {
  const viewController = createViewController('');
  viewController.reloadRelayer = jest.fn().mockResolvedValue(undefined);
  viewController._post = jest.fn().mockResolvedValue(undefined);

  viewController.stopHeartBeat();
  jest.advanceTimersByTime(INITIAL_HEARTBEAT_DELAY);
  await Promise.resolve();
  await Promise.resolve();

  jest.advanceTimersByTime(PING_INTERVAL);
  await Promise.resolve();
  await Promise.resolve();
  jest.advanceTimersByTime(PING_INTERVAL);
  await Promise.resolve();
  await Promise.resolve();

  expect(viewController.reloadRelayer).toHaveBeenCalled();
});

test('heartBeatCheck reloads relayer when pong is stale', async () => {
  const viewController = createViewController('');
  viewController.reloadRelayer = jest.fn().mockResolvedValue(undefined);
  viewController._post = jest.fn().mockResolvedValue(undefined);

  viewController.stopHeartBeat();
  jest.advanceTimersByTime(INITIAL_HEARTBEAT_DELAY);
  await Promise.resolve();

  (viewController as any).lastPongTime = Date.now() - PING_INTERVAL * 3;
  jest.advanceTimersByTime(PING_INTERVAL);
  await Promise.resolve();

  expect(viewController.reloadRelayer).toHaveBeenCalled();
});

test('heartBeatCheck reloads relayer when _post throws', async () => {
  const viewController = createViewController('');
  viewController.reloadRelayer = jest.fn().mockResolvedValue(undefined);
  viewController._post = jest.fn().mockRejectedValue(new Error('post failed'));

  viewController.stopHeartBeat();
  jest.advanceTimersByTime(INITIAL_HEARTBEAT_DELAY);
  await Promise.resolve();
  await Promise.resolve();

  jest.advanceTimersByTime(PING_INTERVAL);
  await Promise.resolve();
  await Promise.resolve();

  expect(viewController.reloadRelayer).toHaveBeenCalled();
});
