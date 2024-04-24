import { MagicUserMetadata, ThirdPartyWalletEvents } from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createPromiEvent } from '../util';

export class ThirdPartyWalletModule extends BaseModule {
  public eventListeners: { event: ThirdPartyWalletEvents; callback: (payloadId: string) => Promise<void> }[] = [];
  public enabledWallets: Record<string, boolean> = {};
  public isConnected = !!localStorage.getItem('3pw_address');

  /* Public Methods */
  public getInfo() {
    switch (localStorage.getItem('3pw_provider')) {
      case 'web3modal':
        return this.web3modalGetInfo();
      default:
        return null;
    }
  }

  public isLoggedIn() {
    switch (localStorage.getItem('3pw_provider')) {
      case 'web3modal':
        return this.web3modalIsLoggedIn();
      default:
        return null;
    }
  }

  public resetState() {
    localStorage.removeItem('3pw_provider');
    localStorage.removeItem('3pw_address');
    localStorage.removeItem('3pw_chainId');
    this.isConnected = false;
  }

  public logout() {
    const provider = localStorage.getItem('3pw_provider');
    this.resetState();
    switch (provider) {
      case 'web3modal': {
        return this.web3modalLogout();
      }
      default:
        return true;
    }
  }

  public requestOverride(payload: any) {
    switch (localStorage.getItem('3pw_provider')) {
      case 'web3modal':
        return this.web3modalRequest(payload);
      default:
        return null;
    }
  }

  /* Web3Modal Methods */
  private web3modalGetInfo() {
    return createPromiEvent<MagicUserMetadata, any>((resolve) => {
      // @ts-ignore
      const walletType = this.sdk.web3modal.modal.getWalletInfo().name;
      // @ts-ignore
      const userAddress = this.sdk.web3modal.modal.getAddress() || localStorage.getItem('3pw_address');
      resolve({
        publicAddress: userAddress,
        email: null,
        issuer: `$did:ethr:${userAddress}`,
        phoneNumber: null,
        isMfaEnabled: false,
        recoveryFactors: [] as any,
        walletType,
      });
    });
  }

  private web3modalIsLoggedIn() {
    return createPromiEvent<boolean, any>((resolve) => {
      setTimeout(() => {
        // @ts-ignore
        const isLoggedIn: boolean = this.sdk.web3modal.modal.getIsConnected();
        resolve(isLoggedIn);
      }, 50);
    });
  }

  private web3modalRequest(payload: any) {
    // @ts-ignore
    return this.sdk.web3modal.modal.getWalletProvider().request(payload);
  }

  private web3modalLogout() {
    // @ts-ignore
    return this.sdk.web3modal.modal?.disconnect();
  }
}
