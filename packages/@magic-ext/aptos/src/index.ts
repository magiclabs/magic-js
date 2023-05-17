import { Extension } from '@magic-sdk/commons';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { AptosAccount, AptosAccountObject } from 'aptos';
import { AptosConfig, ConfigType, AptosPayloadMethod } from './type';

const getAptosConfig = (nodeUrl: string) => {
  if (nodeUrl === 'https://fullnode.mainnet.aptoslabs.com') {
    return {
      rpcUrl: 'https://aptos-mainnet-rpc.allthatnode.com/v1',
      nodeUrl,
      network: 'mainnet',
    };
  }

  if (nodeUrl === 'https://fullnode.testnet.aptoslabs.com') {
    return {
      rpcUrl: 'https://aptos-testnet-rpc.allthatnode.com/v1',
      nodeUrl,
      network: 'testnet',
    };
  }

  if (nodeUrl === 'https://fullnode.devnet.aptoslabs.com') {
    return {
      rpcUrl: '',
      nodeUrl,
      network: 'devnet',
    };
  }

  throw new Error('Invalid nodeUrl');
};

export class AptosExtension extends Extension.Internal<'aptos', any> {
  name = 'aptos' as const;
  config: ConfigType;

  constructor(public aptosConfig: AptosConfig) {
    super();

    this.config = {
      chainType: 'APTOS',
      ...getAptosConfig(aptosConfig.nodeUrl),
      ...aptosConfig,
    };
  }

  getAccount = async () => {
    const accountObject = await this.request<AptosAccountObject>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccount, []),
    );

    const aptosAccount = AptosAccount.fromAptosAccountObject(accountObject);
    return aptosAccount;
  };
}
