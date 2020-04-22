import { PayloadTransport } from '../core/payload-transport';
import { JsonRpcRequestPayload, MagicOutgoingWindowMessage } from '../types';
import { createMalformedResponseError, MagicRPCError } from '../core/sdk-exceptions';
import { ViewController } from '../types/core/view-types';

export abstract class BaseModule {
  constructor(
    private readonly getTransport: () => PayloadTransport,
    private readonly getOverlay: () => ViewController,
  ) {}

  protected get transport() {
    return this.getTransport();
  }

  protected get overlay() {
    return this.getOverlay();
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
