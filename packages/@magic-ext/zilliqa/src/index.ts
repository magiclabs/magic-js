import { Extension } from '@magic-sdk/commons';
import { ZilliqaConfig, ConfigType } from './type';

export class ZilliqaExtension extends Extension.Internal<'zilliqa', ZilliqaConfig> {
  name = 'zilliqa' as const;

  config: ConfigType;

  constructor(public zilliqaConfig: ZilliqaConfig) {
    super();

    this.config = {
      rpcUrl: zilliqaConfig.rpcUrl,
      chainType: 'ZILLIQA',
    };
  }

  public sendTransaction = (params: any, toDs: boolean): Promise<any> => {
    if (params.amount) params.amount = typeof params.amount === 'string' ? params.amount : params.amount.toString();
    if (params.gasPrice)
      params.gasPrice = typeof params.gasPrice === 'string' ? params.gasPrice : params.gasPrice.toString();
    if (params.gasLimit)
      params.gasLimit = typeof params.gasLimit === 'string' ? params.gasLimit : params.gasLimit.toNumber();

    return this.request({
      id: 42,
      method: 'zil_sendTransaction',
      jsonrpc: '2.0',
      params: {
        params,
        toDs,
      },
    });
  };

  public deployContract = (
    init: any,
    code: string,
    params: any,
    attempts: number,
    interval: number,
    toDs: boolean,
  ): Promise<any> => {
    if (params.amount) params.amount = typeof params.amount === 'string' ? params.amount : params.amount.toString();
    if (params.gasPrice)
      params.gasPrice = typeof params.gasPrice === 'string' ? params.gasPrice : params.gasPrice.toString();
    if (params.gasLimit)
      params.gasLimit = typeof params.gasLimit === 'string' ? params.gasLimit : params.gasLimit.toNumber();

    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'zil_deployContract',
      params: {
        init,
        code,
        params,
        attempts,
        interval,
        toDs,
      },
    });
  };

  public callContract = (
    transition: string,
    args: any[],
    params: any,
    attempts = 33,
    interval = 1000,
    toDs = false,
    contractAddress: string,
  ) => {
    if (params.amount) params.amount = typeof params.amount === 'string' ? params.amount : params.amount.toString();
    if (params.gasPrice)
      params.gasPrice = typeof params.gasPrice === 'string' ? params.gasPrice : params.gasPrice.toString();
    if (params.gasLimit)
      params.gasLimit = typeof params.gasLimit === 'string' ? params.gasLimit : params.gasLimit.toNumber();

    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'zil_callContract',
      params: {
        transition,
        args,
        params,
        attempts,
        interval,
        toDs,
        contractAddress,
      },
    });
  };

  public getWallet = (): Promise<object> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'zil_getWallet',
      params: [],
    });
  };
}
