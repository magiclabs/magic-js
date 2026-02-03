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
