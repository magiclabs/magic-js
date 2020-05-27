import { JsonRpcRequestPayload, MagicOutgoingWindowMessage, MagicIncomingWindowMessage } from '../types';
import { createMalformedResponseError, MagicRPCError } from '../core/sdk-exceptions';
import { PayloadTransport } from '../core/payload-transport';
import { ViewController } from '../types/core/view-types';
import { SDKBase } from '../core/sdk';
import { standardizeJsonRpcRequestPayload } from '../core/json-rpc';
import { createPromiEvent } from '../util/promise-tools';
import { TypedEmitter, EventsDefinition } from '../util/events';

export class BaseModule<ModuleEvents extends EventsDefinition = void> extends TypedEmitter<ModuleEvents> {
  constructor(protected readonly sdk: SDKBase) {
    super();
  }

  protected get transport(): PayloadTransport {
    return (this.sdk as any).transport;
  }

  protected get overlay(): ViewController {
    return (this.sdk as any).overlay;
  }

  protected request<ResultType = any, Events extends EventsDefinition = void>(payload: Partial<JsonRpcRequestPayload>) {
    const responsePromise = this.transport.post<ResultType>(
      this.overlay,
      MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST,
      standardizeJsonRpcRequestPayload(payload),
    );

    // PromiEvent-ify the response.
    const promiEvent = createPromiEvent<ResultType, Events>((resolve, reject) => {
      responsePromise.then(res => {
        if (res.hasError) reject(new MagicRPCError(res.payload.error));
        else if (res.hasResult) resolve(res.payload.result as ResultType);
        else throw createMalformedResponseError();
      });
    });

    // Listen for events from the `<iframe>` associated with the current payload
    // and emit those to `PromiEvent` subscribers.
    this.transport.on(MagicIncomingWindowMessage.MAGIC_HANDLE_EVENT, evt => {
      const { response } = evt.data;
      if (response.id === payload.id && response.result?.event) {
        const { event, params = [] } = response.result;
        promiEvent.emit(event, ...params);
      }
    });

    return promiEvent;
  }
}
