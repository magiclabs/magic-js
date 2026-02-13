export enum SmartAccountPayloadMethod {
  Delegate = 'magic_smart_account_delegate',
  SendTransaction = 'magic_smart_account_send_transaction',
}

export interface SmartAccountDelegateParams {
  chainId?: number;
}

export interface SmartAccountDelegateResponse {
  smartAccountAddress: string;
  isDeployed: boolean;
  eoaAddress: string;
}

export interface SmartAccountCallInput {
  to: string;
  data?: string;
  value?: string;
}

export interface SmartAccountTokenRequest {
  address: string;
  amount?: string;
}

export interface SmartAccountSendTransactionParams {
  chainId: number;
  calls: SmartAccountCallInput[];
  sourceChainIds?: number[];
  tokenRequests?: SmartAccountTokenRequest[];
  sponsored?: boolean;
}

export interface SmartAccountSendTransactionResponse {
  intentId: string;
  fillHash: string | undefined;
  claimHashes: string[];
  targetChainId: number;
}
