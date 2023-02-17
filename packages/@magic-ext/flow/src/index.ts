import { Extension } from '@magic-sdk/commons';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as fcl from '@onflow/fcl';
import { FlowConfig } from './type';

export class FlowExtension extends Extension.Internal<'flow', any> {
  name = 'flow' as const;
  config: any = {};

  constructor(public flowConfig: FlowConfig) {
    super();

    this.config = {
      rpcUrl: flowConfig.rpcUrl,
      chainType: 'FLOW',
      options: {
        network: flowConfig.network,
      },
    };
  }

  authorization = async (account: any = {}) => {
    fcl.config().put('accessNode.api', this.config.rpcUrl);
    const addr = await this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'flow_getAccount',
      params: {},
    });
    const keyId = 0;
    let sequenceNum;
    if (account.role.proposer) {
      const response = await fcl.send([fcl.getAccount(addr)]);
      const acct = await fcl.decode(response);
      sequenceNum = acct.keys[keyId].sequenceNumber;
    }

    const signingFunction = async (data: any) => {
      const signature = await this.request({
        id: 42,
        jsonrpc: '2.0',
        method: 'flow_signTransaction',
        params: {
          message: data.message,
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
