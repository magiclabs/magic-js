import {
  JsonRpcBatchRequestPayload,
  JsonRpcError,
  JsonRpcRequestCallback,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
} from './json-rpc-types';

/**
 * The shape of payloads encoded by `FmProvider` while they are queued.
 */
export interface FmRequest {
  payload: JsonRpcRequestPayload;
  onRequestComplete: JsonRpcRequestCallback;
  isFortmaticMethod?: boolean;
}

/**
 * The shape of batch payloads encoded by `FmProvider` while they are queued.
 */
export interface FmBatchRequest {
  payload: JsonRpcBatchRequestPayload;
  onRequestComplete: JsonRpcRequestCallback;
}

/** The shape of responding window message datas from the Fortmatic modal. */
export interface FmResponse<ResultType = any> {
  msgType: string;
  response: Partial<JsonRpcError> & Partial<JsonRpcResponsePayload<ResultType>>;
}

/** The expected message event returned by the Fortmatic modal. */
export interface FmMessageEvent extends MessageEvent {
  data: FmResponse;
}
