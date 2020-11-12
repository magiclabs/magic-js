import { MagicIncomingWindowMessage, MagicMessageRequest } from '@magic-sdk/types';
import { PayloadTransport } from './payload-transport';

export abstract class ViewController<Transport extends PayloadTransport = PayloadTransport> {
  public ready: Promise<void>;
  protected readonly endpoint: string;
  protected readonly parameters: string;

  constructor(protected readonly transport: Transport) {
    if (this.init) this.init();

    this.endpoint = transport.endpoint;
    this.parameters = transport.parameters;

    this.ready = new Promise<void>((resolve) => {
      transport.on(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY, () => resolve());
    });

    transport.on(MagicIncomingWindowMessage.MAGIC_HIDE_OVERLAY, () => {
      if (this.hideOverlay) this.hideOverlay();
    });

    transport.on(MagicIncomingWindowMessage.MAGIC_SHOW_OVERLAY, () => {
      if (this.showOverlay) this.showOverlay();
    });
  }

  protected abstract init(): void;
  public abstract postMessage(data: MagicMessageRequest): Promise<void>;
  protected abstract hideOverlay?(): void;
  protected abstract showOverlay?(): void;
}
