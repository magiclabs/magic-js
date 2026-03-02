import { JsonRpcResponsePayload, JsonRpcError, JsonRpcRequestPayload } from './json-rpc-types';

export enum MagicIncomingWindowMessage {
  MAGIC_HANDLE_RESPONSE = 'MAGIC_HANDLE_RESPONSE',
  MAGIC_OVERLAY_READY = 'MAGIC_OVERLAY_READY',
  MAGIC_SHOW_OVERLAY = 'MAGIC_SHOW_OVERLAY',
  MAGIC_HIDE_OVERLAY = 'MAGIC_HIDE_OVERLAY',
  MAGIC_HANDLE_EVENT = 'MAGIC_HANDLE_EVENT',
  MAGIC_MG_BOX_SEND_RECEIPT = 'MAGIC_MG_BOX_SEND_RECEIPT',
  MAGIC_SEND_PRODUCT_ANNOUNCEMENT = 'MAGIC_SEND_PRODUCT_ANNOUNCEMENT',
  MAGIC_PONG = 'MAGIC_PONG',
  MAGIC_POPUP_RESPONSE = 'MAGIC_POPUP_RESPONSE',
  MAGIC_POPUP_OAUTH_VERIFY_RESPONSE = 'MAGIC_POPUP_OAUTH_VERIFY_RESPONSE',
  MAGIC_THIRD_PARTY_WALLET_REQUEST = 'MAGIC_THIRD_PARTY_WALLET_REQUEST',
}

export enum MagicOutgoingWindowMessage {
  MAGIC_HANDLE_REQUEST = 'MAGIC_HANDLE_REQUEST',
  MAGIC_THIRD_PARTY_WALLET_RESPONSE = 'MAGIC_THIRD_PARTY_WALLET_RESPONSE',
  MAGIC_THIRD_PARTY_WALLET_UPDATE = 'MAGIC_THIRD_PARTY_WALLET_EVENT',
  MAGIC_PING = 'MAGIC_PING',
}

/** The shape of responding window message data from the Magic iframe context. */
export interface MagicMessageRequest {
  msgType: string;
  payload: JsonRpcRequestPayload | JsonRpcRequestPayload[];
  rt?: string;
  jwt?: string;
  deviceShare?: string;
}

/** The shape of responding window message data from the Magic iframe context. */
export interface MagicMessageResponse<ResultType = any> {
  msgType: string;
  response: Partial<JsonRpcError> & Partial<JsonRpcResponsePayload<ResultType>>;
  rt?: string;
  deviceShare?: string;
}

/** The expected message event returned by the Magic iframe context. */
export interface MagicMessageEvent extends Partial<MessageEvent> {
  data: MagicMessageResponse;
}

export interface MagicThirdPartyWalletRequest {
  msgType: MagicIncomingWindowMessage.MAGIC_THIRD_PARTY_WALLET_REQUEST;
  payload: JsonRpcRequestPayload;
}

export interface MagicThirdPartyWalletResponse {
  msgType: `${MagicOutgoingWindowMessage.MAGIC_THIRD_PARTY_WALLET_RESPONSE}-${string}`;
  response: JsonRpcResponsePayload;
}

export interface MagicThirdPartyWalletUpdate {
  msgType: `${MagicOutgoingWindowMessage.MAGIC_THIRD_PARTY_WALLET_UPDATE}-${string}`;
  details: {
    address: `0x${string}` | undefined;
    addresses: readonly `0x${string}`[] | undefined;
    chain: { id: number; name: string; [key: string]: unknown } | undefined;
    updatedField: 'chain' | 'address';
  };
}

export type MagicThirdPartyWalletEventPayload = MagicThirdPartyWalletResponse | MagicThirdPartyWalletUpdate;
