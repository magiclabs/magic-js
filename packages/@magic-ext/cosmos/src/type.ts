export interface CosmosConfig {
  rpcUrl: string;
  chain?: string;
}

export enum CosmosPayloadMethod {
  Sign = 'cos_sign',
  SignTypedData = 'cos_signTypedData',
  SignAndBroadcast = 'cos_signAndBroadcast',
  SendTokens = 'cos_sendTokens',
  ChangeAddress = 'cos_changeAddress',
}
