// @ts-expect-error Module '"@web3modal/ethers5"' has no exported member 'ConfigOptions'.
import { ConfigOptions, Web3ModalOptions } from '@web3modal/ethers5';

export interface Web3ModalExtensionOptions {
  configOptions: ConfigOptions;
  modalOptions: Web3ModalOptions;
}
