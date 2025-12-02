import { Extension } from '@magic-sdk/provider';
import { EVMNetworkConfig, EVMPayloadMethod } from './types';

export class EVMExtension extends Extension.Internal<'evm', any> {
  name = 'evm' as const;
  config: any = {};

  constructor(public evmConfig: EVMNetworkConfig[]) {
    super();

    this.config = {
      networks: evmConfig,
    };
  }

  public switchChain = (chainId: number) => {
    const result = this.request<{
      network:
        | string
        | {
            rpcUrl: string;
            chainId?: number;
            chainType?: string;
          }
        | undefined;
    }>(this.utils.createJsonRpcRequestPayload(EVMPayloadMethod.switchChain, [{ chainId }]));
    console.log('result', result);
    return result;
  };
}
