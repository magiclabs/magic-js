export type AccessListEntry = { address: string; storageKeys: Array<string> };

/**
 *  An ordered collection of [[AccessList]] entries.
 */
export type AccessList = Array<AccessListEntry>;

export enum WalletEventOnReceived {
  WalletInfoFetched = 'Wallet/wallet-info-fetched',
}

/**
 * Request parameters for EIP-7702 authorization signing
 */
export interface Sign7702AuthorizationRequest {
  /**
   * The smart contract implementation address the EOA delegates to
   */
  contractAddress: string;

  /**
   * The chain ID for the network (use 0 for universal cross-chain authorization)
   */
  chainId: number;

  /**
   * The nonce for the EOA account (transaction count)
   */
  nonce?: number;
}

/**
 * Response from EIP-7702 authorization signing
 */
export interface Sign7702AuthorizationResponse {
  /**
   * The contract address that was authorized
   */
  contractAddress: string;

  /**
   * The chain ID for the authorization
   */
  chainId: number;

  /**
   * The nonce used in the authorization
   */
  nonce: number;

  /**
   * The v component of the signature (recovery id)
   */
  v: number;

  /**
   * The r component of the signature
   */
  r: string;

  /**
   * The s component of the signature
   */
  s: string;

  /**
   * Optional: Full signature as hex string
   */
  signature?: string;
}

/**
 * Request parameters for sending an EIP-7702 transaction with authorization list
 */
export interface Send7702TransactionRequest {
  /**
   * The recipient address
   */
  to: string;

  /**
   * The value to send in wei (as hex string)
   */
  value?: string;

  /**
   * The transaction data (calldata)
   */
  data?: string;

  /**
   * Gas limit for the transaction (as hex string)
   */
  gas?: string;

  /**
   * Gas limit for the transaction (alias for gas)
   */
  gasLimit?: string;

  /**
   * Maximum fee per gas for EIP-1559 transactions (as hex string)
   */
  maxFeePerGas?: string;

  /**
   * Maximum priority fee per gas for EIP-1559 transactions (as hex string)
   */
  maxPriorityFeePerGas?: string;

  /**
   * Transaction nonce (if not provided, will be fetched from network)
   */
  nonce?: number;

  /**
   * The list of signed EIP-7702 authorizations to include in the transaction
   */
  authorizationList: Sign7702AuthorizationResponse[];
}

/**
 * Response from sending an EIP-7702 transaction
 */
export interface Send7702TransactionResponse {
  /**
   * The transaction hash
   */
  transactionHash: string;
}
