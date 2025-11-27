/// <reference path="./ambient.d.ts" />

import { Extension } from '@magic-sdk/provider';
import { LocalStorageKeys, ThirdPartyWalletEvents } from '@magic-sdk/types';
import type { EIP1193Provider } from 'viem';
import {
  appKit,
  wagmiAdapter,
  connectMetaMask,
  connectCoinbase,
  connectPhantom,
  connectRabby,
  type ConnectUsingConnectorParams,
  type ConnectorResult,
} from './appkit';

const WALLET_STORAGE_KEYS = {
  metamask: 'metamask',
  coinbase: 'coinbase',
  phantom: 'phantom',
  rabby: 'rabby',
} as const;

type WalletKey = keyof typeof WALLET_STORAGE_KEYS;

type WalletConfig = {
  key: WalletKey;
  event: ThirdPartyWalletEvents;
  connect: (params: Omit<ConnectUsingConnectorParams, 'matchers' | 'label'>) => Promise<ConnectorResult>;
};

type ProviderEventHandler = { event: string; handler: (...args: any[]) => void };

const walletConfigs: WalletConfig[] = [
  {
    key: 'metamask',
    event: ThirdPartyWalletEvents.MetaMaskSelected,
    connect: connectMetaMask,
  },
  {
    key: 'coinbase',
    event: ThirdPartyWalletEvents.CoinbaseSelected,
    connect: connectCoinbase,
  },
  {
    key: 'phantom',
    event: ThirdPartyWalletEvents.PhantomSelected,
    connect: connectPhantom,
  },
  {
    key: 'rabby',
    event: ThirdPartyWalletEvents.RabbySelected,
    connect: connectRabby,
  },
];

export class ThirdPartyWalletsExtension extends Extension.Internal<'thirdPartyWallets'> {
  public readonly name = 'thirdPartyWallets' as const;
  public readonly config = {};

  private provider: EIP1193Provider | null = null;
  private activeWalletKey: WalletKey | null = null;
  private activeConnectorDisconnect: (() => Promise<void>) | null = null;
  private providerEventHandlers: ProviderEventHandler[] = [];

  constructor() {
    super();
  }

  public initialize() {
    walletConfigs.forEach(({ key, event }) => {
      this.sdk.thirdPartyWallets.enabledWallets[key] = true;
      this.sdk.thirdPartyWallets.eventListeners.push({
        event,
        callback: payloadId => this.handleWalletSelection(key, payloadId),
      });
    });

    this.sdk.thirdPartyWallets.isConnected = Boolean(localStorage.getItem(LocalStorageKeys.ADDRESS));
  }

  private async handleWalletSelection(walletKey: WalletKey, payloadId: string) {
    const config = walletConfigs.find(({ key }) => key === walletKey);
    if (!config) return;

    try {
      const result = await config.connect({
        wagmiAdapter,
        isConnected: () => appKit.getIsConnectedState(),
      });

      this.setConnectionState(walletKey, result);
      const address = result.accounts[0];
      if (address) {
        this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletConnected, payloadId)(address);
      } else {
        this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
      }
    } catch (error) {
      console.error('Third-party wallet connection error:', error);
      this.handleConnectionError(payloadId, error);
    }
  }

  private setConnectionState(walletKey: WalletKey, result: ConnectorResult) {
    const address = result.accounts[0];
    localStorage.setItem(LocalStorageKeys.PROVIDER, WALLET_STORAGE_KEYS[walletKey]);
    if (address) {
      localStorage.setItem(LocalStorageKeys.ADDRESS, address);
    }
    localStorage.setItem(LocalStorageKeys.CHAIN_ID, result.chainId.toString());

    this.provider = result.provider;
    this.activeWalletKey = walletKey;
    this.sdk.thirdPartyWallets.isConnected = true;
    const externalProvider = result.provider as unknown as {
      request: (args: { method: string; params?: unknown }) => Promise<unknown>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };

    this.sdk.thirdPartyWallets.setExternalProvider(externalProvider, {
      walletKey,
      disconnect: async () => {
        if (typeof result.connector.disconnect === 'function') {
          await result.connector.disconnect();
        }
      },
    });
    this.activeConnectorDisconnect = async () => {
      if (typeof result.connector.disconnect === 'function') {
        await result.connector.disconnect();
      }
    };

    this.registerProviderListeners(result.provider);
  }

  private registerProviderListeners(provider: EIP1193Provider) {
    this.removeProviderListeners();

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        this.sdk.thirdPartyWallets.resetThirdPartyWalletState();
        this.removeProviderListeners();
        this.sdk.rpcProvider.emit('accountsChanged', []);
        return;
      }
      const address = accounts[0];
      localStorage.setItem(LocalStorageKeys.ADDRESS, address);
      this.sdk.rpcProvider.emit('accountsChanged', accounts);
    };

    const handleChainChanged = (chainId: string | number) => {
      const normalized = this.normalizeChainId(chainId);
      localStorage.setItem(LocalStorageKeys.CHAIN_ID, normalized.toString());
      this.sdk.rpcProvider.emit('chainChanged', normalized);
    };

    const handleDisconnect = () => {
      this.sdk.thirdPartyWallets.resetThirdPartyWalletState();
      this.removeProviderListeners();
      this.provider = null;
      this.activeWalletKey = null;
      this.activeConnectorDisconnect = null;
      this.sdk.thirdPartyWallets.setExternalProvider(null);
      this.sdk.rpcProvider.emit('accountsChanged', []);
    };

    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);
    provider.on?.('disconnect', handleDisconnect);

    this.providerEventHandlers = [
      { event: 'accountsChanged', handler: handleAccountsChanged },
      { event: 'chainChanged', handler: handleChainChanged },
      { event: 'disconnect', handler: handleDisconnect },
    ];
  }

  private removeProviderListeners() {
    if (!this.provider) return;
    this.providerEventHandlers.forEach(({ event, handler }) => {
      this.provider?.removeListener?.(event, handler);
    });
    this.providerEventHandlers = [];
  }

  private normalizeChainId(chainId: string | number) {
    if (typeof chainId === 'number') {
      return chainId;
    }
    if (typeof chainId === 'string') {
      return Number.parseInt(chainId, 16);
    }
    return chainId;
  }

  private handleConnectionError(payloadId: string, error: unknown) {
    console.error('Third-party wallet connection error:', error);
    this.sdk.thirdPartyWallets.resetThirdPartyWalletState();
    this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
    this.removeProviderListeners();
    this.provider = null;
    this.activeWalletKey = null;
    this.activeConnectorDisconnect = null;
    this.sdk.thirdPartyWallets.setExternalProvider(null);
  }
}

export default ThirdPartyWalletsExtension;
