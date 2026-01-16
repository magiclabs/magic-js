export type GasApiResponse = {
  request_id: string;
  state: string;
  success: boolean;
};

export type AccessListEntry = { address: string; storageKeys: Array<string> };

/**
 *  An ordered collection of [[AccessList]] entries.
 */
export type AccessList = Array<AccessListEntry>;

export interface GaslessTransactionRequest {
  /**
   *  The transaction type.
   */
  type?: number;

  /**
   *  The target of the transaction.
   */
  to?: string;

  /**
   *  The sender of the transaction.
   */
  from?: string;

  /**
   *  The nonce of the transaction, used to prevent replay attacks.
   */

  nonce?: number;

  /**
   *  The maximum amount of gas to allow this transaction to consume.
   */
  gasLimit?: bigint;

  /**
   *  The gas price to use for legacy transactions or transactions on
   *  legacy networks.
   *
   *  Most of the time the ``max*FeePerGas`` is preferred.
   */
  gasPrice?: bigint;

  /**
   *  The [[link-eip-1559]] maximum priority fee to pay per gas.
   */
  maxPriorityFeePerGas?: bigint;

  /**
   *  The [[link-eip-1559]] maximum total fee to pay per gas. The actual
   *  value used is protocol enforced to be the block's base fee.
   */
  maxFeePerGas?: bigint;

  /**
   *  The transaction data.
   */
  data?: string;

  /**
   *  The transaction value (in wei).
   */
  value?: bigint;

  /**
   *  The chain ID for the network this transaction is valid on.
   */
  chainId?: bigint;

  /**
   *  The [[link-eip-2930]] access list. Storage slots included in the access
   *  list are //warmed// by pre-loading them, so their initial cost to
   *  fetch is guaranteed, but then each additional access is cheaper.
   */
  accessList?: AccessList;

  /**
   *  A custom object, which can be passed along for network-specific
   *  values.
   */
  customData?: any;
}

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
