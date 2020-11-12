import { MagicIncomingWindowMessage, MagicMessageRequest } from '@magic-sdk/types';
import { PayloadTransport } from './payload-transport';

export abstract class ViewController<Transport extends PayloadTransport = PayloadTransport> {
  public ready: Promise<void>;
  protected readonly endpoint: string;
  protected readonly parameters: string;

  constructor(protected readonly transport: Transport) {
    // Get the `endpoint` and `parameters` value
    // from the underlying `transport` instance.
    this.endpoint = (transport as any).endpoint;
    this.parameters = (transport as any).parameters;

    // Create a promise that resolves when
    // the view is ready for messages.
    this.ready = this.waitForReady();

    if (this.init) this.init();

    this.listen();
  }

  protected abstract init(): void;
  public abstract postMessage(data: MagicMessageRequest): Promise<void>;
  protected abstract hideOverlay(): void;
  protected abstract showOverlay(): void;

  private waitForReady() {
    return new Promise<void>((resolve) => {
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
}
