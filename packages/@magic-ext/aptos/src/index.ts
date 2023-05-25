import { Extension } from '@magic-sdk/commons';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { AptosClient, CoinClient } from 'aptos';
import { AptosConfig, ConfigType, AptosPayloadMethod } from './type';
import { MagicCoinClient } from './lib/MagicCoinClient';
import { MagicAptosClient } from './lib/MagicAptosClient';

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
  readonly config: ConfigType;

  private ac!: MagicAptosClient;
  private cc!: MagicCoinClient;

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

    this.ac = new MagicAptosClient(this.config.nodeUrl, {
      request: this.request,
      createJsonRpcRequestPayload: this.utils.createJsonRpcRequestPayload,
    });
    this.cc = new MagicCoinClient(this.ac, {
      request: this.request,
      createJsonRpcRequestPayload: this.utils.createJsonRpcRequestPayload,
    });
  }

  getAccount = () => {
    return this.request<string>(this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccount, []));
  };

  coinClient = this.cc;
  aptosClient = this.ac;
}
