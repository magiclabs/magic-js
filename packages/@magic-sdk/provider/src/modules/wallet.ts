import UniversalProvider from '@walletconnect/universal-provider';
import { Web3Modal } from '@web3modal/standalone';
import { CoinbaseWalletProvider, CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import {
  Errors,
  Events,
  MagicPayloadMethod,
  RequestUserInfoScope,
  UserEnv,
  UserInfo,
  WalletInfo,
  Wallets,
} from '@magic-sdk/types';

import type { ConfigCtrlState } from '@web3modal/core';

import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { clearKeys } from '../util/web-crypto';
import { setItem, getItem, removeItem } from '../util/storage';

export class WalletModule extends BaseModule {
  /* Prompt Magic's Login Form */
  public connectWithUI() {
    // If within wallet browser, auto-connect without any UI
    if (this.isMetaMaskBrowser() || this.isCoinbaseWalletBrowser()) {
      return this.autoConnectIfWalletBrowser();
    }

    const userEnv = this.getUserEnv();
    const loginRequestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Login, [userEnv]);
    const loginRequest = this.request<string[]>(loginRequestPayload);

    loginRequest.on(Events.WalletSelected as any, async (params: { wallet: Wallets; showModal: boolean }) => {
      try {
        const address = await this.connectToThirdPartyWallet(params.wallet, loginRequestPayload.id, params.showModal);
        setItem(this.localStorageKey, params.wallet);
        this.createIntermediaryEvent(Events.WalletConnected as any, loginRequestPayload.id as any)(address);
      } catch (error) {
        this.createIntermediaryEvent(Events.WalletRejected as any, loginRequestPayload.id as any)();
      }
    });

    return loginRequest;
  }

  /* Returns the provider for the connected wallet */
  public async getProvider(): Promise<any> {
    const activeWallet = await getItem(this.localStorageKey);
    switch (activeWallet) {
      case Wallets.MetaMask:
        return this.getMetaMaskProvider();
      case Wallets.WalletConnect:
        try {
          if (!this.sdk.thirdPartyWalletOptions?.walletConnect) {
            throw new Error(Errors.WalletConnectError);
          }
          return this.getWalletConnectProvider();
        } catch (error) {
          console.error(error);
          return null;
        }
      case Wallets.CoinbaseWallet:
        if (!this.sdk.thirdPartyWalletOptions?.coinbaseWallet) {
          throw new Error(Errors.CoinbaseWalletError);
        }
        return this.getCoinbaseProvider().provider;
      default:
        return this.sdk.rpcProvider;
    }
  }

  /* Prompt Magic's Wallet UI (not available for users logged in with third party wallets) */
  public showUI(): Promise<boolean> {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.ShowUI);
    return this.request<boolean>(requestPayload);
  }

  /* Get user info such as the wallet type they are logged in with */
  public getInfo(): Promise<WalletInfo> {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetInfo);
    return this.request<WalletInfo>(requestPayload);
  }

  /* Request email address from logged in user */
  public requestUserInfoWithUI(scope?: RequestUserInfoScope): Promise<UserInfo> {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.RequestUserInfoWithUI, scope ? [scope] : []);
    return this.request<UserInfo>(requestPayload);
  }

  /* Logout user */
  public disconnect() {
    clearKeys();
    removeItem(this.localStorageKey);
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Disconnect);
    return this.request<boolean>(requestPayload);
  }

  /* Private methods */
  private localStorageKey = 'mc_active_wallet';

  /* MetaMask */
  private isMetaMaskInstalled(): boolean {
    return (
      (window as any).ethereum?.isMetaMask ||
      !!(window as any).ethereum?.providers?.find((provider: any) => provider?.isMetaMask)
    );
  }

  private isMetaMaskBrowser(): boolean {
    return this.isMobile() && this.isMetaMaskInstalled();
  }

  private getMetaMaskProvider(): any {
    return (window as any).ethereum?.providers?.find((p: any) => p?.isMetaMask) || (window as any).ethereum;
  }

  private connectToMetaMask(): Promise<string[]> {
    // Redirect to MetaMask app if user selects MetaMask on mobile
    if (this.isMobile() && !this.isMetaMaskInstalled()) {
      const metaMaskDeepLink = `https://metamask.app.link/dapp/${window.location.href.replace(/(^\w+:|^)\/\//, '')}`;
      window.location.href = metaMaskDeepLink;
    }
    return this.getMetaMaskProvider().request({ method: 'eth_requestAccounts' });
  }

  /* Wallet Connect */
  private async getWalletConnectProvider(): Promise<UniversalProvider> {
    const providerConfig = this.sdk.thirdPartyWalletOptions?.walletConnect?.provider;
    if (!providerConfig) {
      throw new Error(Errors.WalletConnectError);
    }
    const universalProvider = await UniversalProvider.init(providerConfig);
    return universalProvider;
  }

  private async connectToWalletConnect(payloadId: any, showModal?: boolean): Promise<string[]> {
    if (!this.sdk.thirdPartyWalletOptions?.walletConnect) {
      throw new Error(Errors.WalletConnectError);
    }
    const modal = new Web3Modal(this.sdk.thirdPartyWalletOptions?.walletConnect?.modal);
    // Ensure Wallet Connect widget is displayed on top of Magic iframe
    modal.setTheme({ themeZIndex: 2147483660 } as ConfigCtrlState);
    const universalProvider = await this.getWalletConnectProvider();

    universalProvider.on(Events.DisplayUri, async (uri: string) => {
      if (showModal) {
        modal.openModal({ uri });
      } else {
        this.createIntermediaryEvent(Events.Uri as any, payloadId)(uri);
      }
    });

    // Triggers 'display_uri' event
    await universalProvider.connect(this.sdk.thirdPartyWalletOptions?.walletConnect?.connect);
    modal.closeModal();
    return universalProvider.request({ method: 'eth_accounts' });
  }

  /* Coinbase Wallet */
  private isCoinbaseWalletInstalled(): boolean {
    return (
      (window as any).ethereum?.isCoinbaseWallet ||
      !!(window as any).ethereum?.providers?.find((provider: any) => provider?.isCoinbaseWallet)
    );
  }

  private isCoinbaseWalletBrowser(): boolean {
    return (
      (window as any).ethereum?.isCoinbaseBrowser ||
      !!(window as any).ethereum?.providers?.find((provider: any) => provider?.isCoinbaseBrowser)
    );
  }

  private getCoinbaseProvider(): { provider: CoinbaseWalletProvider; qrCodeUrl: string | null } {
    const providerConfig = this.sdk.thirdPartyWalletOptions?.coinbaseWallet?.provider;
    const sdkConfig = this.sdk.thirdPartyWalletOptions?.coinbaseWallet?.sdk;
    if (!providerConfig || !sdkConfig) {
      throw new Error(Errors.CoinbaseWalletError);
    }
    const coinbaseWallet = new CoinbaseWalletSDK({
      ...sdkConfig,
      overrideIsMetaMask: false,
      headlessMode: true,
    });
    const qrCodeUrl = coinbaseWallet.getQrUrl();
    const provider = coinbaseWallet.makeWeb3Provider(providerConfig.jsonRpcUrl, providerConfig.chainId);
    return { provider, qrCodeUrl };
  }

  private connectToCoinbaseWallet(payloadId: any): Promise<string[]> {
    // Redirect to Coinbase Wallet app if user selects Coinbase Wallet on mobile
    if (this.isMobile() && !this.isCoinbaseWalletBrowser()) {
      const coinbaseWalletDeepLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`;
      window.location.href = coinbaseWalletDeepLink;
    }
    if (!this.sdk.thirdPartyWalletOptions?.coinbaseWallet) {
      throw new Error(Errors.CoinbaseWalletError);
    }
    const coinbase = this.getCoinbaseProvider();
    if (coinbase.qrCodeUrl) {
      this.createIntermediaryEvent(Events.Uri as any, payloadId)(coinbase.qrCodeUrl);
    }
    return coinbase.provider.request({ method: 'eth_requestAccounts' });
  }

  /* Helpers */
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent.toLocaleLowerCase(),
    );
  }

  private getUserEnv(): UserEnv {
    return {
      env: {
        isMetaMaskInstalled: this.isMetaMaskInstalled(),
        isCoinbaseWalletInstalled: this.isCoinbaseWalletInstalled(),
      },
    };
  }

  private async connectToThirdPartyWallet(provider: Wallets, payloadId: any, showModal?: boolean): Promise<any> {
    let address;
    switch (provider) {
      case Wallets.MetaMask:
        address = await this.connectToMetaMask();
        break;
      case Wallets.WalletConnect:
        address = await this.connectToWalletConnect(payloadId, showModal);
        break;
      case Wallets.CoinbaseWallet:
        address = await this.connectToCoinbaseWallet(payloadId);
        break;
      default:
        break;
    }
    return address;
  }

  private async autoConnectIfWalletBrowser(): Promise<string[]> {
    let wallet;
    let address;

    if (this.isMetaMaskBrowser()) {
      try {
        wallet = Wallets.MetaMask;
        address = await this.getMetaMaskProvider().request({ method: 'eth_requestAccounts' });
        setItem(this.localStorageKey, Wallets.MetaMask);
      } catch (error) {
        console.error(error);
      }
    } else if (this.isCoinbaseWalletBrowser()) {
      try {
        wallet = Wallets.CoinbaseWallet;
        address = await this.getCoinbaseProvider().provider.request({ method: 'eth_requestAccounts' });
        setItem(this.localStorageKey, Wallets.CoinbaseWallet);
      } catch (error) {
        console.error(error);
      }
    }
    const autoConnectPayload = createJsonRpcRequestPayload(MagicPayloadMethod.AutoConnect, [{ wallet, address }]);
    const autoConnectRequest = this.request<string[]>(autoConnectPayload);
    return autoConnectRequest;
  }
}
