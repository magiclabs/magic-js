import { Extension } from '@magic-sdk/commons';
import { TezosConfig, ConfigType } from './type';

export class TezosExtension extends Extension.Internal<'tezos', TezosConfig> {
  name = 'tezos' as const;

  config: ConfigType;

  constructor(public tezosConfig: TezosConfig) {
    super();

    this.config = {
      rpcUrl: tezosConfig.rpcUrl,
      chainType: 'TEZOS',
    };
  }

  public sendTransactionOperation = (
    to: string,
    amount: number,
    fee: number,
    derivationPath: string,
  ): Promise<string> => {
    return this.request({
      id: 42,
      method: 'tezos_sendTransaction',
      jsonrpc: '2.0',
      params: {
        to,
        amount,
        fee,
        derivationPath,
      },
    });
  };

  public sendContractOriginationOperation = (
    amount: number,
    delegate: any,
    fee: number,
    derivationPath: string,
    storage_limit: number,
    gas_limit: number,
    code: string,
    storage: string,
    codeFormat: string,
  ): Promise<any> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'tezos_sendContractOriginationOperation',
      params: {
        amount,
        delegate,
        fee,
        derivationPath,
        storage_limit,
        gas_limit,
        code,
        storage,
        codeFormat,
      },
    });
  };

  public sendContractInvocationOperation = (
    contract: string,
    amount: number,
    fee: number,
    derivationPath: string | undefined,
    storageLimit: number,
    gasLimit: number,
    entrypoint: string | undefined,
    parameters: string | undefined,
    parameterFormat?: string,
  ) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'tezos_sendContractInvocationOperation',
      params: {
        contract,
        amount,
        fee,
        derivationPath,
        storageLimit,
        gasLimit,
        entrypoint,
        parameters,
        parameterFormat,
      },
    });
  };

  public sendContractPing = (
    contract: string,
    amount: number,
    fee: number,
    derivationPath: string | undefined,
    storageLimit: number,
    gasLimit: number,
  ) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'tezos_sendContractPing',
      params: {
        contract,
        amount,
        fee,
        derivationPath,
        storageLimit,
        gasLimit,
      },
    });
  };

  public sendDelegationOperation = (to: string, amount: number) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'tezos_sendDelegationOperation',
      params: {
        to,
        amount,
      },
    });
  };

  public getAccount = (): Promise<string> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'tezos_getAccount',
      params: [],
    });
  };
}
