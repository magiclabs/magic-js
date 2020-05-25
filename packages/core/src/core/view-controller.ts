import { PayloadTransport } from './payload-transport';
import { MagicIncomingWindowMessage, MagicMessageRequest } from '../types';

export abstract class ViewController<Transport extends PayloadTransport = PayloadTransport> {
  public ready: Promise<void>;

  constructor(
    protected readonly transport: Transport,
    protected readonly endpoint: string,
    protected readonly encodedQueryParams: string,
  ) {
    this.ready = this.waitForReady();
    this.init();
    this.listen();
  }

  /**
   * Set the controller as "ready" for JSON RPC events.
   */
  private waitForReady() {
    return new Promise<void>(resolve => {
      this.transport.on(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY, () => resolve());
    });
  }

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

  protected abstract init(): void;
  public abstract postMessage(data: MagicMessageRequest): Promise<void>;
  protected abstract hideOverlay(): void;
  protected abstract showOverlay(): void;
}
