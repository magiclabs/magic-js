import { AccountInfo } from '@aptos-labs/wallet-adapter-core';
import { AptosAccount } from 'aptos';

export interface AptosConfig {
  nodeUrl: string;
}

export enum AptosPayloadMethod {
  AptosGetAccount = 'aptos_getAccount',
  AptosSignTransaction = 'aptos_signTransaction',
  AptosGetAccountInfo = 'aptos_getAccountInfo',
  AptosSignAndSubmitTransaction = 'aptos_signAndSubmitTransaction',
  AptosSignAndSubmitBCSTransaction = 'aptos_signAndSubmitBCSTransaction',
  AptosSignMessage = 'aptos_signMessage',
  AptosSignMessageAndVerify = 'aptos_signMessageAndVerify',
}

export interface MagicAptosWalletConfig {
  connect: () => Promise<AccountInfo>;
}
