/// <reference path="./ambient.d.ts" />

import { arbitrum, mainnet, optimism, polygon, sepolia } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { ConnectorAlreadyConnectedError, connect, getConnectors, type Connector } from '@wagmi/core';
import type { EIP1193Provider } from 'viem';

const PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694';

export const networks = [arbitrum, mainnet, optimism, polygon, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  projectId: PROJECT_ID,
  networks,
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId: PROJECT_ID,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#000000',
  },
  features: {
    analytics: true,
  },
});

type MaybeConnector = Connector | undefined;

type MatcherConfig = {
  ids?: string[];
  nameIncludes?: string[];
  rdnsIncludes?: string[];
};

export type ConnectUsingConnectorParams = {
  wagmiAdapter: WagmiAdapter;
  isConnected?: () => boolean;
  matchers: MatcherConfig;
  label: string;
};

export type ConnectorResult = {
  accounts: readonly `0x${string}`[];
  chainId: number;
  provider: EIP1193Provider;
  connector: Connector;
};

let connectorsInitialized = false;

const toLowerCase = (value: string | undefined | null) => (typeof value === 'string' ? value.toLowerCase() : undefined);

const toLowerCaseArray = (values: string[] | undefined) =>
  Array.isArray(values) ? values.filter(Boolean).map(value => value.toLowerCase()) : [];

const ensureConnectorsReady = async (adapter: WagmiAdapter) => {
  if (connectorsInitialized) return;
  if (typeof adapter?.syncConnectors !== 'function') {
    connectorsInitialized = true;
    return;
  }
  await adapter.syncConnectors();
  connectorsInitialized = true;
};

const getActiveConnection = (adapter: WagmiAdapter) => {
  const state = adapter?.wagmiConfig?.state;
  if (!(state?.connections instanceof Map) || !state?.current) {
    return undefined;
  }
  return state.connections.get(state.current);
};

const matchesConnector = (connector: MaybeConnector, matchers: Required<MatcherConfig>) => {
  if (!connector) return false;
  const connectorId = toLowerCase(connector.id);
  const connectorName = toLowerCase(connector.name);
  const rdnsValues = Array.isArray(connector.rdns) ? connector.rdns : connector?.rdns ? [connector.rdns] : [];

  if (connectorId && matchers.ids.some(targetId => connectorId === targetId || connectorId.includes(targetId))) {
    return true;
  }

  if (connectorName && matchers.nameIncludes.some(keyword => connectorName.includes(keyword))) {
    return true;
  }

  return rdnsValues.some((rdnsValue: string) => {
    const rdnsLower = toLowerCase(rdnsValue);
    if (!rdnsLower) return false;
    return matchers.rdnsIncludes.some(keyword => rdnsLower.includes(keyword));
  });
};

const getMatchers = (matchers: MatcherConfig) => ({
  ids: toLowerCaseArray(matchers.ids),
  nameIncludes: toLowerCaseArray(matchers.nameIncludes),
  rdnsIncludes: toLowerCaseArray(matchers.rdnsIncludes),
});

const resolveConnectorResult = async (
  connector: Connector,
  accounts: readonly `0x${string}`[],
  chainId: number,
): Promise<ConnectorResult> => {
  const provider = (await connector.getProvider()) as EIP1193Provider;
  return {
    accounts,
    chainId,
    provider,
    connector,
  };
};

export const connectUsingConnector = async ({
  wagmiAdapter: adapter,
  isConnected,
  matchers,
  label,
}: ConnectUsingConnectorParams): Promise<ConnectorResult> => {
  if (!adapter?.wagmiConfig) {
    throw new Error('A valid wagmiAdapter with wagmiConfig is required');
  }

  const checkIsConnected = () =>
    typeof isConnected === 'function' ? isConnected() : adapter.wagmiConfig.state.status === 'connected';

  await ensureConnectorsReady(adapter);

  const normalizedMatchers = getMatchers(matchers);

  const connectors = getConnectors(adapter.wagmiConfig) ?? [];
  const targetConnector = connectors.find((connector: Connector) => matchesConnector(connector, normalizedMatchers));

  if (!targetConnector) {
    throw new Error(`${label} connector not found`);
  }

  const activeConnection = getActiveConnection(adapter);
  if (activeConnection?.connector?.id === targetConnector.id) {
    if (!checkIsConnected()) {
      throw new Error(`Failed to connect to ${label}`);
    }

    return resolveConnectorResult(targetConnector, activeConnection.accounts, activeConnection.chainId);
  }

  try {
    const connection = await connect(adapter.wagmiConfig, {
      connector: targetConnector,
    });

    if (!checkIsConnected()) {
      throw new Error(`Failed to connect to ${label}`);
    }

    return resolveConnectorResult(targetConnector, connection.accounts, connection.chainId);
  } catch (error) {
    console.error(`${label} connection error:`, error);
    if (error instanceof ConnectorAlreadyConnectedError && checkIsConnected()) {
      const fallbackConnection = getActiveConnection(adapter);
      if (fallbackConnection?.connector?.id === targetConnector.id) {
        return resolveConnectorResult(targetConnector, fallbackConnection.accounts, fallbackConnection.chainId);
      }
    }

    throw error;
  }
};

export const connectMetaMask = (params: Omit<ConnectUsingConnectorParams, 'matchers' | 'label'>) =>
  connectUsingConnector({
    ...params,
    label: 'MetaMask',
    matchers: {
      ids: ['metamask', 'metamasksdk'],
      nameIncludes: ['metamask'],
      rdnsIncludes: ['metamask'],
    },
  });

export const connectCoinbase = (params: Omit<ConnectUsingConnectorParams, 'matchers' | 'label'>) =>
  connectUsingConnector({
    ...params,
    label: 'Coinbase Wallet',
    matchers: {
      ids: ['coinbasewallet', 'coinbasewalletsdk'],
      nameIncludes: ['coinbase'],
      rdnsIncludes: ['coinbase'],
    },
  });

export const connectPhantom = (params: Omit<ConnectUsingConnectorParams, 'matchers' | 'label'>) =>
  connectUsingConnector({
    ...params,
    label: 'Phantom',
    matchers: {
      ids: ['phantom'],
      nameIncludes: ['phantom'],
      rdnsIncludes: ['phantom'],
    },
  });

export const connectRabby = (params: Omit<ConnectUsingConnectorParams, 'matchers' | 'label'>) =>
  connectUsingConnector({
    ...params,
    label: 'Rabby Wallet',
    matchers: {
      ids: ['rabby'],
      nameIncludes: ['rabby'],
      rdnsIncludes: ['rabby'],
    },
  });
