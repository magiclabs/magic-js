export enum SmartAccountPayloadMethod {
  SendTransaction = 'magic_smart_account_send_transaction',
}

export interface SmartAccountConfig {
  alchemyApiKey: string;
  paymasterPolicyId?: string;
}

export interface SmartAccountCallInput {
  to: string;
  data?: string;
  value?: string;
}

export interface SmartAccountSendTransactionParams {
  chainId: number;
  calls: SmartAccountCallInput[];
}

export interface SmartAccountSendTransactionResponse {
  id: string;
  transactionHash: string | undefined;
  chainId: number;
}
