import { JsonRpcRequestPayload, MagicOutgoingWindowMessage } from '../types';
import { createMalformedResponseError, MagicRPCError } from '../core/sdk-exceptions';
import { PayloadTransport } from '../core/payload-transport';
import { ViewController } from '../types/core/view-types';
import { SDKBase } from '../core/sdk';
import { standardizeJsonRpcRequestPayload } from '../core/json-rpc';
import { createPromiEvent, EventsDefinition } from '../util/promise-tools';

export class BaseModule {
  constructor(protected readonly sdk: SDKBase) {}

  protected get transport(): PayloadTransport {
    return (this.sdk as any).transport;
  }

  protected get overlay(): ViewController {
    return (this.sdk as any).overlay;
  }

  protected request<ResultType = any, Events extends EventsDefinition = {}>(payload: JsonRpcRequestPayload) {
    const responsePromise = this.transport.post<ResultType>(
      this.overlay,
      MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST,
      standardizeJsonRpcRequestPayload(payload),
    );

    return createPromiEvent<ResultType, Events>((resolve, reject) => {
      responsePromise.then(res => {
        if (res.hasError) reject(new MagicRPCError(res.payload.error));
        else if (res.hasResult) resolve(res.payload.result as ResultType);
        else throw createMalformedResponseError();
      });
    });
  }
}
