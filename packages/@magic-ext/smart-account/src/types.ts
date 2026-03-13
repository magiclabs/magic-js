export enum SmartAccountPayloadMethod {
  Delegate = 'magic_smart_account_delegate',
  SendTransaction = 'magic_smart_account_send_transaction',
}

export interface SmartAccountConfig {
  alchemyApiKey: string;
  paymasterPolicyId?: string;
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

export interface SmartAccountSendTransactionParams {
  chainId: number;
  calls: SmartAccountCallInput[];
}

export interface SmartAccountSendTransactionResponse {
  id: string;
  transactionHash: string | undefined;
  chainId: number;
}
