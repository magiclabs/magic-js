import { Extension } from '@magic-sdk/commons';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BCS } from 'aptos';
import { AptosConfig, ConfigType, AptosPayloadMethod } from './type';

const getDefaultConfig = (nodeUrl: string) => {
  if (nodeUrl === 'https://fullnode.mainnet.aptoslabs.com') {
    return {
      rpcUrl: 'https://aptos-mainnet-rpc.allthatnode.com/v1',
      network: 'mainnet',
      chainId: 1,
    };
  }

  if (nodeUrl === 'https://fullnode.testnet.aptoslabs.com') {
    return {
      rpcUrl: 'https://aptos-testnet-rpc.allthatnode.com/v1',
      network: 'testnet',
      chainId: 2,
    };
  }

  if (nodeUrl === 'https://fullnode.devnet.aptoslabs.com') {
    return {
      rpcUrl: '',
      network: 'devnet',
      chainId: 54,
    };
  }

  throw new Error('Invalid nodeUrl');
};

export class AptosExtension extends Extension.Internal<'aptos', any> {
  name = 'aptos' as const;
  config: ConfigType;

  constructor(public aptosConfig: AptosConfig) {
    super();

    const defaultConfig = getDefaultConfig(aptosConfig.nodeUrl);

    this.config = {
      chainType: 'APTOS',
      nodeUrl: aptosConfig.nodeUrl,
      rpcUrl: aptosConfig.rpcUrl ?? defaultConfig.rpcUrl,
      network: aptosConfig.network ?? defaultConfig.network,
      chainId: aptosConfig.chainId ?? defaultConfig.chainId,
    };
  }

  getAccount = () => {
    return this.request<string>(this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccount, []));
  };

  signTransaction = (rawTransaction: any) => {
    if (rawTransaction.serialize === undefined) {
      throw new Error('Invalid transaction');
    }

    const s = new BCS.Serializer();
    rawTransaction.serialize(s);
    const serialized = s.getBytes();

    return this.request<Uint8Array>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignTransaction, [serialized]),
    );
  };
}
