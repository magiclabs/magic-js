export interface SubtensorConfig {
  rpcUrl: string;
}

export interface ConfigType {
  rpcUrl: string;
  chainType: string;
}

export interface AddProxyParams {
  delegate: string;
  proxyType?: string;
  delay?: number;
}

export interface AddStakeParams {
  hotkey: string;
  amount: string | bigint;
  netuid?: number;
}

export interface RemoveStakeParams {
  hotkey: string;
  amount: string | bigint;
  netuid?: number;
}

export interface MoveStakeParams {
  originHotkey: string;
  destHotkey: string;
  amount: string | bigint;
  originNetuid?: number;
  destNetuid?: number;
}

export interface TransferParams {
  to: string;
  amount: string | bigint;
}

export interface SignedTransactionResult {
  txHash: string;
}

export interface SignedRawResult {
  signature: string;
}
