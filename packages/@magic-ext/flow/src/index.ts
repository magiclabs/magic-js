import { Extension } from '@magic-sdk/commons';

// @ts-ignore
import * as fcl from '@onflow/fcl';
import { FlowConfig, FlowPayloadMethod } from './type';

export class FlowExtension extends Extension.Internal<'flow', any> {
  name = 'flow' as const;
  config: any = {};

  constructor(public flowConfig: FlowConfig) {
    super();

    this.config = {
      rpcUrl: flowConfig.rpcUrl,
      chainType: 'FLOW',
      network: flowConfig.network,
    };
  }

  getAccount = () => {
    return this.request(this.utils.createJsonRpcRequestPayload(FlowPayloadMethod.FlowGetAccount, []));
  };

  authorization = async (account: any = {}) => {
    fcl.config().put('accessNode.api', this.config.rpcUrl);
    const addr = await this.request(this.utils.createJsonRpcRequestPayload(FlowPayloadMethod.FlowGetAccount, []));
    const keyId = 0;
    let sequenceNum;
    if (account?.role?.proposer) {
      const response = await fcl.account(addr);
      sequenceNum = response.keys[keyId].sequenceNumber;
    }

    const signingFunction = async (data: any) => {
      const signature = await this.request({
        id: 42,
        jsonrpc: '2.0',
        method: 'flow_signTransaction',
        params: {
          message: data.message,
          cadence: data.cadence,
        },
      });

      return {
        addr,
        keyId,
        signature,
      };
    };

    return {
      ...account,
      addr,
      keyId,
      signingFunction,
      sequenceNum,
    };
  };
}
