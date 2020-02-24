import { PayloadTransport } from '../core/payload-transport';
import { JsonRpcRequestPayload, MagicOutgoingWindowMessage } from '../types';
import { JsonRpcErrorWrapper } from '../core/json-rpc';

export class BaseModule {
  constructor(private readonly transport: PayloadTransport) {}

  protected async request<ResultType = any>(payload: JsonRpcRequestPayload) {
    const response = await this.transport.post<ResultType>(MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST, payload);

    if (response.hasError) throw new JsonRpcErrorWrapper(response.payload.error);
    else if (response.hasResult) return response.payload.result as ResultType;
    else throw new Error(); // Malformed
  }
}
