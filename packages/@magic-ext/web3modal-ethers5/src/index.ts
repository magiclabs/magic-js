import { Extension } from '@magic-sdk/commons';
import { Web3Modal, createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { ThirdPartyWalletEvents } from '@magic-sdk/types';
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

    const unsubscribeFromProviderEvents = this.modal.subscribeProvider(({ status }) => {
      if (status === 'connected') {
        unsubscribeFromProviderEvents();
        this.setIsConnected();
        this.setEip1193EventListeners();
      }
      if (status === 'disconnected') {
        unsubscribeFromProviderEvents();
      }
    });
  }

  public setIsConnected() {
    localStorage.setItem('magic_3pw_provider', 'web3modal');
    localStorage.setItem('magic_3pw_address', this.modal.getAddress() as string);
    localStorage.setItem('magic_3pw_chainId', (this.modal.getChainId() as number).toString());
    this.sdk.thirdPartyWallets.isConnected = true;
  }

  public initialize() {
    this.sdk.thirdPartyWallets.enabledWallets.web3modal = true;
    this.sdk.thirdPartyWallets.isConnected = Boolean(localStorage.getItem('magic_3pw_address'));
    this.sdk.thirdPartyWallets.eventListeners.push({
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
        this.sdk.thirdPartyWallets.resetThirdPartyWalletState();
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

  private handleUserConnected(payloadId: string, address: string = this.modal.getAddress() as string) {
    this.setIsConnected();
    this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletConnected, payloadId)(address);
    this.setEip1193EventListeners();
  }

  private connectToWeb3modal(payloadId: string) {
    const { modal } = this;

    const promiEvent = this.utils.createPromiEvent<string[]>(async () => {
      try {
        if (modal.getIsConnected()) {
          await modal.disconnect();
        }
      } catch (error) {
        console.error(error);
      }

      // Listen for wallet connected event
      const unsubscribeFromProviderEvents = modal.subscribeProvider(({ address, error }) => {
        // User rejected connection request
        if (error) {
          unsubscribeFromProviderEvents();
          this.createIntermediaryEvent(ThirdPartyWalletEvents.WalletRejected, payloadId)();
        }
        // If user connected wallet, keep listeners active
        if (address) {
          this.handleUserConnected(payloadId);
          unsubscribeFromProviderEvents();
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
