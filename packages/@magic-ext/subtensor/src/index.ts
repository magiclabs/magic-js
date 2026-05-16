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

  public getAccount = (): Promise<string> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_getAccount',
      params: [],
    });
  };

  public sendTransaction = (params: TransferParams): Promise<SignedTransactionResult> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_sendTransaction',
      params,
    });
  };

  public addProxy = (params: AddProxyParams): Promise<SignedTransactionResult> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_addProxy',
      params,
    });
  };

  public addStake = (params: AddStakeParams): Promise<SignedTransactionResult> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_addStake',
      params,
    });
  };

  public removeStake = (params: RemoveStakeParams): Promise<SignedTransactionResult> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_removeStake',
      params,
    });
  };

  public moveStake = (params: MoveStakeParams): Promise<SignedTransactionResult> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'subtensor_moveStake',
      params,
    });
  };

  public signRaw = (payload: Record<string, unknown>): Promise<SignedRawResult> => {
    return this.request({
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
