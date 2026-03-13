// Mock for @aptos-labs/wallet-standard
export interface AptosSignMessageInput {
  address?: boolean;
  application?: boolean;
  chainId?: boolean;
  message: string;
  nonce: string;
}

export interface AptosSignMessageOutput {
  address?: string;
  application?: string;
  chainId?: number;
  fullMessage: string;
  message: string;
  nonce: string;
  prefix: string;
  signature: string;
  bitmap?: Uint8Array;
}

export interface AptosWallet {
  readonly name: string;
  readonly url: string;
  readonly icon: string;
}
