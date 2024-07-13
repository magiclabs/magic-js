// @ts-expect-error Module '"@web3modal/ethers"' has no exported member 'ConfigOptions'.
import { ConfigOptions, Web3ModalOptions } from '@web3modal/ethers';

export interface Web3ModalExtensionOptions {
  configOptions: ConfigOptions;
  modalOptions: Web3ModalOptions;
}
