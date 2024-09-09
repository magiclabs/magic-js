export interface CosmosConfig {
  rpcUrl: string;
  prefix?: string;
  network?: string;
}

export enum CosmosPayloadMethod {
  Sign = 'cos_sign',
  SignAndBroadcast = 'cos_signAndBroadcast',
  SendTokens = 'cos_sendTokens',
  ChangeAddress = 'cos_changeAddress',
}
