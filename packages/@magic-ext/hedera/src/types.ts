export interface HederaConfig {
  network: string;
}

export enum HederaPayloadMethod {
  HederaSign = 'hedera_sign',
  HederaGetPublicKey = 'hedera_getPublicKey',
  HederaGetPublicAddress = 'get_multichain_public_address',
}
