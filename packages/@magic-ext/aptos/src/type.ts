export interface AptosConfig {
  nodeUrl: string;
}

export enum AptosPayloadMethod {
  AptosGetEmailFromUser = 'aptos_getEmailFromUser',
  AptosGetAccount = 'aptos_getAccount',
  AptosGetAccountInfo = 'aptos_getAccountInfo',
  AptosSignTransaction = 'aptos_signTransaction',
  AptosSignAndSubmitTransaction = 'aptos_signAndSubmitTransaction',
  AptosSignAndSubmitBCSTransaction = 'aptos_signAndSubmitBCSTransaction',
  AptosSignMessage = 'aptos_signMessage',
  AptosSignMessageAndVerify = 'aptos_signMessageAndVerify',
}

export interface MagicAptosWalletConfig {
  loginWith: 'magicLink';
}
