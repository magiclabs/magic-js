import { Extension, JsonRpcRequestPayload, MagicUserMetadata, ThirdPartyWalletEvents } from '@magic-sdk/commons';
import { Web3Modal, createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { DefaultEvents, EventsDefinition, PromiEvent } from '@magic-sdk/provider';
import { Web3ModalExtensionOptions } from './types';

export class Web3ModalExtension extends Extension.Internal<'web3ModalEthers5', any> {
  name = 'web3ModalEthers5' as const;
  config: any = {};
  web3Modal: Web3Modal;
  connectedPublicAddress: string | undefined;
  connectedChainId: number | undefined;

  static eventsListenerAdded = false;

  constructor({ configOptions, modalOptions }: Web3ModalExtensionOptions) {
    super();
    this.web3Modal = createWeb3Modal({
      ...modalOptions,
      ...{ themeVariables: { '--w3m-z-index': 3000000000 } },
      ethersConfig: defaultConfig({ metadata: configOptions }),
    });

    // Set delay for web3modal to register if user is connected
    setTimeout(() => {
      if (!this.web3Modal.getIsConnected()) return;
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
    this.connectedPublicAddress = this.web3Modal.getAddress();
    this.connectedChainId = this.web3Modal.getChainId();
  }

  private setEip1193EventListenersIfConnected() {
    if (Web3ModalExtension.eventsListenerAdded) return;
    Web3ModalExtension.eventsListenerAdded = true;
    this.web3Modal.subscribeProvider(({ address, chainId }) => {
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
    const { web3Modal } = this as Web3ModalExtension;

    const promiEvent = this.utils.createPromiEvent<string[]>(async () => {
      // Listen for wallet connected
      const unsubscribeFromProviderEvents = web3Modal.subscribeProvider(({ address, chainId, error }: any) => {
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
      const unsubscribeFromModalEvents = web3Modal.subscribeEvents((event) => {
        const userClosedModal = event.data.event === 'MODAL_CLOSE';
        const userRejectedConnectionInWallet = event.data.event === 'CONNECT_ERROR';
        if (userClosedModal || userRejectedConnectionInWallet) {
          unsubscribeFromModalEvents();
          // Remove listener for wallet connected
          unsubscribeFromProviderEvents();
          this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
        }
      });

      web3Modal.open();
    });

    return promiEvent;
  }

  private getInfoOverride() {
    const promiEvent = this.utils.createPromiEvent<MagicUserMetadata, any>((resolve) => {
      setTimeout(() => {
        const address = this.web3Modal.getAddress();
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
    const promiEvent = this.utils.createPromiEvent<boolean, any>((resolve) => {
      setTimeout(() => {
        if (this.web3Modal.getIsConnected()) {
          resolve(true);
        } else {
          resolve(super.sdk.user.isLoggedIn());
        }
      }, 50);
    });
    return promiEvent;
  }

  private logoutOverride() {
    this.web3Modal.disconnect();
    return super.sdk.user.logout();
  }

  private requestOverride<ResultType = any, Events extends EventsDefinition = void>(
    payload: Partial<JsonRpcRequestPayload>,
  ) {
    if (this.web3Modal.getIsConnected()) {
      const promiEvent = this.utils.createPromiEvent<ResultType, Events>((resolve, reject) => {
        return (this.web3Modal.getWalletProvider() as any)
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
