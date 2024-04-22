import { ThirdPartyWalletEvents } from '@magic-sdk/types';
import { BaseModule } from './base-module';

export class ThirdPartyWalletModule extends BaseModule {
  public eventListeners: { event: ThirdPartyWalletEvents; callback: (payloadId: string) => Promise<void> }[] = [];
  public enabledWallets: Record<string, boolean> = {};
}
