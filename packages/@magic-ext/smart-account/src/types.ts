export enum SmartAccountPayloadMethod {
  SendTransaction = 'magic_smart_account_send_transaction',
}

export interface AlchemySmartAccountConfig {
  provider?: 'alchemy';
  apiKey: string;
  paymasterPolicyId?: string;
}

export type SmartAccountConfig = AlchemySmartAccountConfig;

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
