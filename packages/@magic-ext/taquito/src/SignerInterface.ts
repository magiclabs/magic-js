/**
 * @description Signer interface which is used across taquito in order to sign and inject operation
 */
export interface Signer {
  /**
   *
   * @param op Operation to sign
   * @param magicByte Magic bytes 1 for block, 2 for endorsement, 3 for generic, 5 for the PACK format of michelson
   */
  sign(
    op: string,
    magicByte?: Uint8Array,
  ): Promise<{
    bytes: string;
    sig: string;
    prefixSig: string;
    sbytes: string;
  }>;
  /**
   * @description Return the public key of the account used by the signer
   */
  publicKey(): Promise<string>;

  /**
   * @description Return the public key hash of the account used by the signer
   */
  publicKeyHash(): Promise<string>;

  /**
   * @description Optionally return the secret key of the account used by the signer
   */
  secretKey(): Promise<string | undefined>;
}
