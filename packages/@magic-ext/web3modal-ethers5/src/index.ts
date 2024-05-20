import { Extension, ThirdPartyWalletEvents } from '@magic-sdk/commons';
import { Web3Modal, createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { Web3ModalExtensionOptions } from './types';

export class Web3ModalExtension extends Extension.Internal<'web3modal'> {
  name = 'web3modal' as const;
  config = {};
  modal: Web3Modal;

  static eventsListenerAdded = false;

  constructor({ configOptions, modalOptions }: Web3ModalExtensionOptions) {
    super();

    this.modal = createWeb3Modal({
      ...modalOptions,
      ...{ themeVariables: { ...(modalOptions.themeVariables || {}), '--w3m-z-index': 3000000000 } },
      ethersConfig: defaultConfig({ metadata: configOptions }),
    });

    // Set delay for web3modal to register if user is connected
    setTimeout(() => {
      if (!this.modal.getIsConnected()) return;
      this.setIsConnected();
      this.setEip1193EventListeners();
    }, 50);
  }

  public setIsConnected() {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    localStorage.setItem('magic_3pw_address', this.modal.getAddress() as string);
    localStorage.setItem('magic_3pw_chainId', (this.modal.getChainId() as number).toString());
    this.sdk.thirdPartyWallet.isConnected = true;
  }

  public initialize() {
    this.sdk.thirdPartyWallet.enabledWallets.web3modal = true;
    this.sdk.thirdPartyWallet.isConnected = Boolean(localStorage.getItem('magic_3pw_address'));
    this.sdk.thirdPartyWallet.eventListeners.push({
      event: ThirdPartyWalletEvents.Web3ModalSelected,
      callback: async (payloadId) => {
        await this.connectToWeb3modal(payloadId);
      },
    });
  }

  private setEip1193EventListeners() {
    if (Web3ModalExtension.eventsListenerAdded) return;
    Web3ModalExtension.eventsListenerAdded = true;

    this.modal.subscribeProvider(({ address, chainId }) => {
      // If user disconnected all accounts from wallet
      if (!address && localStorage.getItem('magic_3pw_address')) {
        this.sdk.thirdPartyWallet.resetState();
        return this.sdk.rpcProvider.emit('accountsChanged', []);
      }
      if (address && address !== localStorage.getItem('magic_3pw_address')) {
        localStorage.setItem('magic_3pw_address', address);
        return this.sdk.rpcProvider.emit('accountsChanged', [address]);
      }
      if (chainId && chainId !== Number(localStorage.getItem('magic_3pw_chainId'))) {
        localStorage.setItem('magic_3pw_chainId', chainId.toString());
        return this.sdk.rpcProvider.emit('chainChanged', chainId);
      }
      return null;
    });
  }

  private connectToWeb3modal(payloadId: string) {
    const { modal } = this;

    const promiEvent = this.utils.createPromiEvent<string[]>(() => {
      // Listen for wallet connected
      const unsubscribeFromProviderEvents = modal.subscribeProvider(({ address, error }) => {
        // User rejected connection request
        if (error) {
          unsubscribeFromProviderEvents();
          this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
        }
        // If user connected wallet, keep listeners active
        if (address) {
          this.setIsConnected();
          this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletConnected, payloadId)(address);
          unsubscribeFromProviderEvents();
          this.setEip1193EventListeners();
        }
      });

      // Listen for modal close before user connects wallet
      const unsubscribeFromModalEvents = modal.subscribeEvents((event) => {
        if (event.data.event === 'MODAL_CLOSE') {
          unsubscribeFromModalEvents();
          unsubscribeFromProviderEvents();
          this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
        }
      });

      modal.open();
    });

    return promiEvent;
  }
}
