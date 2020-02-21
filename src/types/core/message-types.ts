import { JsonRpcResponsePayload, JsonRpcError } from './json-rpc-types';

export enum MagicIncomingWindowMessage {
  MAGIC_HANDLE_RESPONSE = 'MAGIC_HANDLE_RESPONSE',
  MAGIC_OVERLAY_READY = 'MAGIC_OVERLAY_READY',
  MAGIC_SHOW_OVERLAY = 'MAGIC_SHOW_OVERLAY',
  MAGIC_HIDE_OVERLAY = 'MAGIC_HIDE_OVERLAY',
}

export enum MagicOutgoingWindowMessage {
  MAGIC_HANDLE_REQUEST = 'MAGIC_HANDLE_REQUEST',
}

/** The shape of responding window message datas from the Fortmatic modal. */
export interface MagicResponse<ResultType = any> {
  msgType: string;
  response: Partial<JsonRpcError> & Partial<JsonRpcResponsePayload<ResultType>>;
}

/** The expected message event returned by the Fortmatic modal. */
export interface MagicMessageEvent extends MessageEvent {
  data: MagicResponse;
}
