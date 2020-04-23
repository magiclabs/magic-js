import { JsonRpcRequestPayload, MagicOutgoingWindowMessage } from '../types';
import { createMalformedResponseError, MagicRPCError } from '../core/sdk-exceptions';
import { PayloadTransport } from '../core/payload-transport';
import { ViewController } from '../types/core/view-types';
import { SDKBase } from '../core/sdk';

export class BaseModule {
  constructor(protected readonly sdk: SDKBase) {}

  protected get transport(): PayloadTransport {
    return (this.sdk as any).transport;
  }

  protected get overlay(): ViewController {
    return (this.sdk as any).overlay;
  }

  protected async request<ResultType = any>(payload: JsonRpcRequestPayload) {
    const response = await this.transport.post<ResultType>(
      this.overlay,
      MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST,
      payload,
    );

    if (response.hasError) throw new MagicRPCError(response.payload.error);
    else if (response.hasResult) return response.payload.result as ResultType;
    else throw createMalformedResponseError();
  }
}
