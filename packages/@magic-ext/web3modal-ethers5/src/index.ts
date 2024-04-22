import { Extension, JsonRpcRequestPayload, MagicUserMetadata, ThirdPartyWalletEvents } from '@magic-sdk/commons';
import { Web3Modal, createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { DefaultEvents, EventsDefinition, PromiEvent, createPromiEvent } from '@magic-sdk/provider';
import { Web3ModalExtensionOptions } from './types';

export class Web3ModalExtension extends Extension.Internal<'web3modal', any> {
  name = 'web3modal' as const;
  config: any = {};
  modal: Web3Modal;
  connectedPublicAddress: string | undefined;
  connectedChainId: number | undefined;

  static eventsListenerAdded = false;

  constructor({ configOptions, modalOptions }: Web3ModalExtensionOptions) {
    super();
    console.log('super.sdk', super.sdk);
    // @ts-ignore
    this.modal = createWeb3Modal({
      ...modalOptions,
      ...{ themeVariables: { '--w3m-z-index': 3000000000 } },
      ethersConfig: defaultConfig({ metadata: configOptions }),
    });

    // Set delay for web3modal to register if user is connected
    setTimeout(() => {
      // @ts-ignore
      if (!this.sdk.web3modal.modal.getIsConnected()) return;
      this.setThirdPartyWalletInfo();
      this.setEip1193EventListenersIfConnected();
    }, 50);
  }

  public initialize() {
    this.setOverrides();
    this.sdk.thirdPartyWallet.enabledWallets.web3Modal = true;
    this.sdk.thirdPartyWallet.eventListeners.push({
      event: ThirdPartyWalletEvents.Web3ModalSelected,
      callback: async (payloadId) => {
        await this.connectToWeb3Modal(payloadId);
      },
    });
  }

  private setThirdPartyWalletInfo() {
    // @ts-ignore
    this.connectedPublicAddress = this.sdk.web3modal.modal.getAddress();
    // @ts-ignore
    this.connectedChainId = this.sdk.web3modal.modal.getChainId();
  }

  private setEip1193EventListenersIfConnected() {
    if (Web3ModalExtension.eventsListenerAdded) return;
    Web3ModalExtension.eventsListenerAdded = true;
    // @ts-ignore
    this.sdk.web3modal.modal.subscribeProvider(({ address, chainId }) => {
      if (address && address !== this.connectedPublicAddress) {
        this.connectedPublicAddress = address;
        this.sdk.rpcProvider.emit('accountsChanged', [address]);
      }
      if (chainId && chainId !== this.connectedChainId) {
        this.connectedChainId = chainId;
        this.sdk.rpcProvider.emit('chainChanged', chainId);
      }
    });
  }

  private connectToWeb3Modal(payloadId: string) {
    const { modal } = this as Web3ModalExtension;

    const promiEvent = createPromiEvent<string[]>(async () => {
      // Listen for wallet connected
      const unsubscribeFromProviderEvents = modal.subscribeProvider(({ address, chainId, error }: any) => {
        // User rejected connection request
        if (error) {
          unsubscribeFromProviderEvents();
          this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
        }
        // If user connected wallet, keep listeners active
        if (address) {
          // unsubscribeFromProviderEvents();
          this.connectedPublicAddress = address;
          this.connectedChainId = chainId;
          this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletConnected as any, payloadId as any)(address);
        }
      });

      // Listen for connection rejected
      const unsubscribeFromModalEvents = modal.subscribeEvents((event) => {
        const userClosedModal = event.data.event === 'MODAL_CLOSE';
        const userRejectedConnectionInWallet = event.data.event === 'CONNECT_ERROR';
        if (userClosedModal || userRejectedConnectionInWallet) {
          unsubscribeFromModalEvents();
          // Remove listener for wallet connected
          unsubscribeFromProviderEvents();
          this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
        }
      });

      modal.open();
    });

    return promiEvent;
  }

  private getInfoOverride() {
    const promiEvent = createPromiEvent<MagicUserMetadata, any>((resolve) => {
      setTimeout(() => {
        // @ts-ignore
        const address = this.sdk.web3modal.modal.getAddress();
        if (address) {
          resolve({
            publicAddress: address,
            email: null,
            issuer: `$did:ethr:${address}`,
            phoneNumber: null,
            isMfaEnabled: false,
            recoveryFactors: [undefined as any],
            // walletType: 'web3Modal',
          });
        } else {
          resolve(super.sdk.user.getInfo());
        }
      }, 50);
    });
    return promiEvent;
  }

  private isLoggedInOverride() {
    const promiEvent = createPromiEvent<boolean, any>((resolve) => {
      setTimeout(() => {
        // @ts-ignore
        if (this.sdk.web3modal.modal.getIsConnected()) {
          resolve(true);
        } else {
          resolve(super.sdk.user.isLoggedIn());
        }
      }, 50);
    });
    return promiEvent;
  }

  private logoutOverride() {
    // @ts-ignore
    this.sdk.web3modal.modal.disconnect();
    return super.sdk.user.logout();
  }

  private requestOverride<ResultType = any, Events extends EventsDefinition = void>(
    payload: Partial<JsonRpcRequestPayload>,
  ) {
    // @ts-ignore
    if (this.sdk.web3modal.modal.getIsConnected()) {
      const promiEvent = createPromiEvent<ResultType, Events>((resolve, reject) => {
        // @ts-ignore
        return (this.sdk.web3modal.modal.getWalletProvider() as any)
          .request(payload)
          .then((res: ResultType | PromiseLike<ResultType>) => {
            resolve(res);
          })
          .catch(reject);
      });
      return promiEvent;
    }
    return super.sdk.rpcProvider.request(payload) as PromiEvent<
      ResultType,
      Events extends void ? DefaultEvents<ResultType> : Events & DefaultEvents<ResultType>
    >;
  }

  private setOverrides() {
    this.sdk.user.getInfo = this.getInfoOverride;
    this.sdk.user.isLoggedIn = this.isLoggedInOverride;
    this.sdk.user.logout = this.logoutOverride;
    this.sdk.rpcProvider.request = this.requestOverride;
  }
}
