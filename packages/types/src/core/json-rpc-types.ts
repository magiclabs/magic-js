import { RPCErrorCode } from './exception-types';

// --- Request interfaces

export interface JsonRpcRequestPayload<TParams = any> {
  jsonrpc: string;
  id: string | number | null;
  method: string;
  params?: TParams;
}

export interface JsonRpcRequestCallback {
  /** Callback executed upon JSON RPC response. */
  (err: JsonRpcError | null, result?: JsonRpcResponsePayload | null): void;
}

export interface JsonRpcBatchRequestCallback {
  /** Callback executed upon JSON RPC response. */
  (err: JsonRpcError | null, result?: (JsonRpcResponsePayload | null)[] | null): void;
}

// --- Response interfaces

export interface JsonRpcError {
  message: string;
  code: RPCErrorCode;
}

export interface JsonRpcResponsePayload<ResultType = any> {
  jsonrpc: string;
  id: string | number | null;
  result?: ResultType | null;
  error?: JsonRpcError | null;
}

// --- Payload methods

/**
 * Enum of JSON RPC methods for interacting with the Magic SDK authentication
 * relayer.
 */
export enum MagicPayloadMethod {
  LoginWithMagicLink = 'magic_auth_login_with_magic_link',
  GetIdToken = 'magic_auth_get_id_token',
  GenerateIdToken = 'magic_auth_generate_id_token',
  GetMetadata = 'magic_auth_get_metadata',
  IsLoggedIn = 'magic_auth_is_logged_in',
  Logout = 'magic_auth_logout',
  UpdateEmail = 'magic_auth_update_email',
}
