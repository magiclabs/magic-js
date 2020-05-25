import { MagicIncomingWindowMessage, MagicMessageRequest } from '@magic-sdk/types';
import { PayloadTransport } from './payload-transport';

export abstract class ViewController<Transport extends PayloadTransport = PayloadTransport> {
  public ready: Promise<void>;

  constructor(
    protected readonly transport: Transport,
    protected readonly endpoint: string,
    protected readonly encodedQueryParams: string,
  ) {
    this.ready = new Promise(resolve => {
      this.transport.on(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY, () => resolve());
    });

    if (this.init) this.init();
    this.listen();
  }

  protected abstract init(): void;
  public abstract postMessage(data: MagicMessageRequest): Promise<void>;
  protected abstract hideOverlay(): void;
  protected abstract showOverlay(): void;

  /**
   * Listen for messages sent from the underlying Magic `<WebView>`.
   */
  private listen() {
    this.transport.on(MagicIncomingWindowMessage.MAGIC_HIDE_OVERLAY, () => {
      this.hideOverlay();
    });

    this.transport.on(MagicIncomingWindowMessage.MAGIC_SHOW_OVERLAY, () => {
      this.showOverlay();
    });
  }
}
