import { Extension, type SDKBase } from '@magic-sdk/provider';
import { LocalStorageKeys, ThirdPartyWalletEvents, type JsonRpcRequestPayload } from '@magic-sdk/types';
import { SiweExtension } from '@magic-ext/siwe';
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

type ProviderEvent = 'accountsChanged' | 'chainChanged' | 'disconnect';

type ProviderEventHandler = { event: ProviderEvent; handler: (...args: any[]) => void };

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

const SIGN_EVENT_MAP: Record<WalletKey, string> = {
  metamask: 'metamask_sign',
  coinbase: 'coinbase_sign',
  phantom: 'phantom_sign',
  rabby: 'rabby_sign',
};

export class ThirdPartyWalletsExtension extends Extension.Internal<'thirdPartyWallets'> {
  public readonly name = 'thirdPartyWallets' as const;
  public readonly config = {};

  private provider: EIP1193Provider | null = null;
  private activeWalletKey: WalletKey | null = null;
  private activeConnectorDisconnect: (() => Promise<void>) | null = null;
  private providerEventHandlers: ProviderEventHandler[] = [];
  private thirdPartyWalletsModule: any;
  private setExternalProviderFn:
    | ((provider: unknown, options?: { disconnect?: () => Promise<void>; walletKey?: string | null }) => void)
    | null = null;
  private resetThirdPartyWalletStateFn: (() => void) | null = null;
  private requestOverrideFn: ((payload: Partial<JsonRpcRequestPayload>) => unknown) | null = null;
  private initialized = false;
  private siweExtension: SiweExtension | null = null;
  private pendingConnections = new Map<
    string,
    {
      walletKey: WalletKey;
      result: ConnectorResult;
    }
  >();

  constructor() {
    super();
  }

  public init(sdk: SDKBase) {
    const thirdPartyWalletsModule = (sdk as any).thirdPartyWallets;
    this.thirdPartyWalletsModule = thirdPartyWalletsModule;

    if (thirdPartyWalletsModule) {
      if (typeof thirdPartyWalletsModule.setExternalProvider === 'function') {
        this.setExternalProviderFn = thirdPartyWalletsModule.setExternalProvider.bind(thirdPartyWalletsModule);
      }
      if (typeof thirdPartyWalletsModule.resetThirdPartyWalletState === 'function') {
        this.resetThirdPartyWalletStateFn =
          thirdPartyWalletsModule.resetThirdPartyWalletState.bind(thirdPartyWalletsModule);
      }
      if (typeof thirdPartyWalletsModule.requestOverride === 'function') {
        this.requestOverrideFn = thirdPartyWalletsModule.requestOverride.bind(thirdPartyWalletsModule);
      }
    }

    const existingSiweExtension = (sdk as any).siwe as SiweExtension | undefined;
    if (existingSiweExtension) {
      if (typeof existingSiweExtension.init === 'function') {
        existingSiweExtension.init(sdk);
      }
      this.siweExtension = existingSiweExtension;
    } else {
      const siweExtension = new SiweExtension();
      siweExtension.init(sdk);
      (sdk as any).siwe = siweExtension;
      this.siweExtension = siweExtension;
    }

    super.init(sdk);
    this.initialize();
  }

  private getThirdPartyWalletsModule() {
    if (!this.thirdPartyWalletsModule) {
      throw new Error('Third-party wallets module not initialized');
    }
    return this.thirdPartyWalletsModule;
  }

  public get eventListeners() {
    return this.getThirdPartyWalletsModule().eventListeners;
  }

  public get enabledWallets() {
    return this.getThirdPartyWalletsModule().enabledWallets;
  }

  public get isConnected() {
    return this.getThirdPartyWalletsModule().isConnected;
  }

  public set isConnected(isConnected: boolean) {
    this.getThirdPartyWalletsModule().isConnected = isConnected;
  }

  public resetThirdPartyWalletState() {
    this.pendingConnections.clear();
    if (this.resetThirdPartyWalletStateFn) {
      return this.resetThirdPartyWalletStateFn();
    }
    const module = this.getThirdPartyWalletsModule();
    if (module && typeof module.resetThirdPartyWalletState === 'function') {
      this.resetThirdPartyWalletStateFn = module.resetThirdPartyWalletState.bind(module);
      return this.resetThirdPartyWalletStateFn?.();
    }
    return undefined;
  }

  public setExternalProvider(
    provider: unknown,
    options?: { disconnect?: () => Promise<void>; walletKey?: string | null },
  ) {
    if (this.setExternalProviderFn) {
      return this.setExternalProviderFn?.(provider, options);
    }
    const module = this.getThirdPartyWalletsModule();
    if (module && typeof module.setExternalProvider === 'function') {
      this.setExternalProviderFn = module.setExternalProvider.bind(module);
      return this.setExternalProviderFn?.(provider, options);
    }
    return undefined;
  }

  public requestOverride(payload: Partial<JsonRpcRequestPayload>) {
    if (this.requestOverrideFn) {
      return this.requestOverrideFn?.(payload);
    }
    const module = this.getThirdPartyWalletsModule();
    if (module && typeof module.requestOverride === 'function') {
      this.requestOverrideFn = module.requestOverride.bind(module);
      return this.requestOverrideFn?.(payload);
    }
    return undefined;
  }

  public initialize() {
    if (this.initialized) {
      console.log('[ThirdPartyWalletsExtension] Already initialized');
      return;
    }

    console.log('[ThirdPartyWalletsExtension] Initializing...');
    const thirdPartyWallets = this.getThirdPartyWalletsModule();
    walletConfigs.forEach(({ key, event }) => {
      thirdPartyWallets.enabledWallets[key] = true;
      console.log('[ThirdPartyWalletsExtension] Registering listener for', { key, event });
      thirdPartyWallets.eventListeners.push({
        event,
        callback: (payloadId: string) => this.handleWalletSelection(key, payloadId),
      });
    });

    Object.entries(SIGN_EVENT_MAP).forEach(([key, event]) => {
      console.log('[ThirdPartyWalletsExtension] Registering sign listener for', { key, event });
      thirdPartyWallets.eventListeners.push({
        event,
        callback: (payloadId: string) => this.handleSiweSign(key as WalletKey, payloadId),
      });
    });

    console.log('[ThirdPartyWalletsExtension] Total eventListeners:', thirdPartyWallets.eventListeners.length);
    this.isConnected = Boolean(localStorage.getItem(LocalStorageKeys.ADDRESS));
    this.initialized = true;
  }

  private async handleWalletSelection(walletKey: WalletKey, payloadId: string) {
    console.log('[ThirdPartyWalletsExtension] handleWalletSelection called', { walletKey, payloadId });
    const config = walletConfigs.find(({ key }) => key === walletKey);
    if (!config) {
      console.warn('[ThirdPartyWalletsExtension] No config found for walletKey', walletKey);
      return;
    }

    console.log('[ThirdPartyWalletsExtension] Calling config.connect...', { walletKey });
    try {
      const result = await config.connect({
        wagmiAdapter,
        isConnected: () => appKit.getIsConnectedState(),
      });

      console.log('[ThirdPartyWalletsExtension] Connect result:', { walletKey, result });
      this.setConnectionState(walletKey, result);
      const address = result.accounts[0];
      if (!address) {
        console.warn('[ThirdPartyWalletsExtension] No address in result');
        this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
        return;
      }

      console.log('[ThirdPartyWalletsExtension] Setting pending connection and emitting third_party_wallet_connected', {
        payloadId,
        address,
      });
      this.pendingConnections.set(payloadId, { walletKey, result });
      this.createIntermediaryEvent(
        'third_party_wallet_connected' as unknown as ThirdPartyWalletEvents,
        payloadId,
      )({
        walletKey,
        address,
        chainId: result.chainId,
      });
      console.log('[ThirdPartyWalletsExtension] Emitted third_party_wallet_connected');
    } catch (error) {
      console.error('[ThirdPartyWalletsExtension] Connection error:', error);
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

    const thirdPartyWallets = this.getThirdPartyWalletsModule();

    this.provider = result.provider;
    this.activeWalletKey = walletKey;
    thirdPartyWallets.activeWalletKey = walletKey;
    this.isConnected = true;
    const externalProvider = result.provider as unknown as {
      request: (args: { method: string; params?: unknown }) => Promise<unknown>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };

    this.setExternalProvider(externalProvider, {
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
    const thirdPartyWallets = this.getThirdPartyWalletsModule();
    this.removeProviderListeners();

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        this.resetThirdPartyWalletState();
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
      this.resetThirdPartyWalletState();
      this.removeProviderListeners();
      this.provider = null;
      this.activeWalletKey = null;
      this.activeConnectorDisconnect = null;
      this.setExternalProvider(null);
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
    this.resetThirdPartyWalletState();
    this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
    this.removeProviderListeners();
    this.provider = null;
    this.activeWalletKey = null;
    this.activeConnectorDisconnect = null;
    this.setExternalProvider(null);
    this.pendingConnections.delete(payloadId);
  }

  private async handleSiweSign(walletKey: WalletKey, payloadId: string) {
    console.log('[ThirdPartyWalletsExtension] handleSiweSign called', { walletKey, payloadId });
    const pending = this.pendingConnections.get(payloadId);
    if (!pending || pending.walletKey !== walletKey) {
      console.warn('[ThirdPartyWalletsExtension] missing pending connection for SIWE', {
        walletKey,
        payloadId,
        pending: pending ? { walletKey: pending.walletKey } : null,
      });
      this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
      return;
    }

    const address = pending.result.accounts[0];
    if (!address) {
      console.warn('[ThirdPartyWalletsExtension] No address in pending connection');
      this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
      this.pendingConnections.delete(payloadId);
      return;
    }

    console.log('[ThirdPartyWalletsExtension] Generating SIWE payload...', {
      address,
      chainId: pending.result.chainId,
    });
    try {
      const siwePayload = await this.tryGenerateSiwePayload(address, pending.result.chainId);
      console.log('[ThirdPartyWalletsExtension] SIWE payload generated:', siwePayload ? 'success' : 'failed');
      if (siwePayload) {
        console.log('[ThirdPartyWalletsExtension] Emitting wallet_connected with SIWE payload');
        this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletConnected, payloadId)(siwePayload);
      } else {
        console.log('[ThirdPartyWalletsExtension] Emitting wallet_connected with address only');
        this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletConnected, payloadId)(address);
      }
    } catch (error) {
      console.error('[ThirdPartyWalletsExtension] SIWE signing error:', error);
      this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
    } finally {
      this.pendingConnections.delete(payloadId);
    }
  }

  private async tryGenerateSiwePayload(address: string, chainId: number) {
    const siweExtension = this.siweExtension;
    if (!siweExtension || typeof siweExtension.generateMessage !== 'function') {
      return null;
    }

    try {
      const message = await siweExtension.generateMessage({ address, chainId });
      const signature = await this.signSiweMessage(address, message);
      if (!signature) {
        return null;
      }

      return {
        address,
        message,
        signature,
        chainId,
      };
    } catch (error) {
      console.error('Third-party wallet SIWE error:', error);
      return null;
    }
  }

  private async signSiweMessage(address: string, message: string) {
    const provider = this.provider as unknown as {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    if (!provider?.request) {
      return null;
    }

    try {
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address],
      });
      return signature as string;
    } catch (error) {
      try {
        const signature = await provider.request({
          method: 'eth_sign',
          params: [address, message],
        });
        return signature as string;
      } catch (fallbackError) {
        console.error('Third-party wallet SIWE signature error:', fallbackError);
        return null;
      }
    }
  }
}

export default ThirdPartyWalletsExtension;
