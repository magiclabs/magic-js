import { MagicOutgoingWindowMessage } from '@magic-sdk/types';
import { createViewController, TestViewController } from '../../../factories';
import { createModalNotReadyError } from '../../../../src/core/sdk-exceptions';

let viewController: TestViewController;

beforeEach(() => {
  viewController = createViewController('asdf');
  viewController.isReadyForRequest = true;
  viewController.isConnectedToInternet = true;
  viewController.checkRelayerExistsInDOM = jest.fn(() => Promise.resolve(true));
  viewController.reloadRelayer = jest.fn(() => Promise.resolve(undefined));
  viewController.waitForReady = jest.fn(() => Promise.resolve(undefined));
  viewController._post = jest.fn(() => Promise.resolve(undefined));
});

test('Rejects when not connected to internet', async () => {
  viewController.isConnectedToInternet = false;
  const details = { type: 'update' };

  try {
    await viewController.postThirdPartyWalletUpdate(details);
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toEqual(createModalNotReadyError());
  }
});

test('Reloads relayer when it does not exist in DOM', async () => {
  viewController.checkRelayerExistsInDOM = jest.fn(() => Promise.resolve(false));
  const details = { type: 'update' };

  await viewController.postThirdPartyWalletUpdate(details);

  expect(viewController.isReadyForRequest).toBe(false);
  expect(viewController.reloadRelayer).toHaveBeenCalledTimes(1);
  expect(viewController.waitForReady).toHaveBeenCalledTimes(1);
  expect(viewController._post).toHaveBeenCalledWith({
    msgType: `${MagicOutgoingWindowMessage.MAGIC_THIRD_PARTY_WALLET_UPDATE}-${viewController.parameters}`,
    details,
  });
});

test('Waits for ready when not ready for request', async () => {
  viewController.isReadyForRequest = false;
  const details = { type: 'update' };

  await viewController.postThirdPartyWalletUpdate(details);

  expect(viewController.waitForReady).toHaveBeenCalledTimes(1);
  expect(viewController._post).toHaveBeenCalledWith({
    msgType: `${MagicOutgoingWindowMessage.MAGIC_THIRD_PARTY_WALLET_UPDATE}-${viewController.parameters}`,
    details,
  });
});

test('Posts message and resolves successfully', async () => {
  const details = { type: 'update' };

  await viewController.postThirdPartyWalletUpdate(details);

  expect(viewController._post).toHaveBeenCalledWith({
    msgType: `${MagicOutgoingWindowMessage.MAGIC_THIRD_PARTY_WALLET_UPDATE}-${viewController.parameters}`,
    details,
  });
  expect(viewController.checkRelayerExistsInDOM).toHaveBeenCalledTimes(1);
});
