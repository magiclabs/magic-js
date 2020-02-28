import { PayloadTransport } from '../core/payload-transport';
import { JsonRpcRequestPayload, MagicOutgoingWindowMessage } from '../types';
import { JsonRpcErrorWrapper } from '../core/json-rpc';
import { IframeController } from '../core/iframe-controller';
import { createMalformedResponseError } from '../core/sdk-exceptions';

export abstract class BaseModule {
  constructor(
    private readonly getTransport: () => PayloadTransport,
    private readonly getOverlay: () => IframeController,
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

    if (response.hasError) throw new JsonRpcErrorWrapper(response.payload.error);
    else if (response.hasResult) return response.payload.result as ResultType;
    else throw createMalformedResponseError();
  }
}
