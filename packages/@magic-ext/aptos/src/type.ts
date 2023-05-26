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

  AptosTokenClientBurnByCreator = 'aptos_tokenClient_burnByCreator',
  AptosTokenClientBurnByOwner = 'aptos_tokenClient_burnByOwner',
  AptosTokenClientCancelTokenOffer = 'aptos_tokenClient_cancelTokenOffer',
  AptosTokenClientClaimToken = 'aptos_tokenClient_claimToken',
  AptosTokenClientCreateCollection = 'AptosTokenClientCreateCollection',
  AptosTokenClientCreateToken = 'aptos_tokenClient_createToken',
  AptosTokenClientCreateTokenWithMutabilityConfig = 'aptos_tokenClient_createTokenWithMutabilityConfig',
  AptosTokenClientMutateTokenProperties = 'aptos_tokenClient_mutateTokenProperties',
  AptosTokenClientOfferToken = 'aptos_tokenClient_offerToken',
  AptosTokenClientOptInTokenTransfer = 'AptosTokenClientOptInTokenTransfer',
  AptosTokenClientTransferWithOptIn = 'AptosTokenClientTransferWithOptIn',
}

export type MagicUtils = {
  request: <T>(payload: any) => Promise<T>;
  createJsonRpcRequestPayload: (method: string, params: any[]) => any;
};
