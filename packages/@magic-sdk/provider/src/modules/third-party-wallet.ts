import { BaseModule } from './base-module';

export class ThirdPartyWalletModule extends BaseModule {
  public eventListeners: { event: 'web3modal-selected'; callback: (payloadId: string) => Promise<void> }[] = [];
  public enabledWallets: Record<string, boolean> = {};
}
