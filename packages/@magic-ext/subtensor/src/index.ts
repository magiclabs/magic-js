import { MultichainExtension } from '@magic-sdk/provider';

import type {
  AddProxyParams,
  AddStakeParams,
  MoveStakeParams,
  RemoveStakeParams,
  SignedRawResult,
  SignedTransactionResult,
  SubtensorConfig,
  TransferParams,
} from './type';

export class SubtensorExtension extends MultichainExtension<'subtensor'> {
  name = 'subtensor' as const;

  constructor(public subtensorConfig: SubtensorConfig) {
    super({
      rpcUrl: subtensorConfig.rpcUrl,
      chainType: 'SUBTENSOR',
    });
  }

  public getAccount = () => {
    return this.request<string>({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_getAccount',
      params: [],
    });
  };

  public sendTransaction = (params: TransferParams) => {
    return this.request<SignedTransactionResult>({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_sendTransaction',
      params,
    });
  };

  public addProxy = (params: AddProxyParams) => {
    return this.request<SignedTransactionResult>({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_addProxy',
      params,
    });
  };

  public addStake = (params: AddStakeParams) => {
    return this.request<SignedTransactionResult>({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_addStake',
      params,
    });
  };

  public removeStake = (params: RemoveStakeParams) => {
    return this.request<SignedTransactionResult>({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_removeStake',
      params,
    });
  };

  public moveStake = (params: MoveStakeParams) => {
    return this.request<SignedTransactionResult>({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_moveStake',
      params,
    });
  };

  public signRaw = (payload: Record<string, unknown>) => {
    return this.request<SignedRawResult>({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_signRaw',
      params: payload,
    });
  };
}

export type {
  AddProxyParams,
  AddStakeParams,
  MoveStakeParams,
  RemoveStakeParams,
  SignedRawResult,
  SignedTransactionResult,
  SubtensorConfig,
  TransferParams,
} from './type';
