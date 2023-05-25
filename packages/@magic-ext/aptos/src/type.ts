export interface AptosConfig {
  nodeUrl: string;
  rpcUrl?: string;
  network?: string;
  chainId?: number;
}

export interface ConfigType {
  rpcUrl: string;
  nodeUrl: string;
  network: string;
  chainType: string;
  chainId: number;
}

export enum AptosPayloadMethod {
  AptosGetAccount = 'aptos_getAccount',
  AptosSignTransaction = 'aptos_signTransaction',

  AptosCoinClientCheckBalance = 'aptos_coinClient_checkBalance',
  AptosCoinClientTransfer = 'aptos_coinClient_transfer',

  AptosAptosClientGenerateSignSubmitTransaction = 'aptos_aptosClient_generateSignSubmitTransaction',
  AptosAptosClientGenerateSignSubmitWaitForTransaction = 'aptos_aptosClient_generateSignSubmitWaitForTransaction',
  AptosAptosClientPublishPackage = 'aptos_aptosClient_publishPackage',
  AptosAptosClientRotateAuthKeyEd25519 = 'aptos_aptosClient_rotateAuthKeyEd25519',
  AptosAptosClientSignTransaction = 'aptos_aptosClient_signTransaction',
  AptosAptosClientSimultateTransaction = 'aptos_aptosClient_simultateTransaction',
}

export type MagicUtils = {
  request: <T>(payload: any) => Promise<T>;
  createJsonRpcRequestPayload: (method: string, params: any[]) => any;
};
