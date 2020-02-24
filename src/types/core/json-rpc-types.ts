// --- Request interfaces

export interface JsonRpcRequestPayload {
  jsonrpc: string;
  method: string;
  params: any[];
  id: string | number;
}

// --- Response interfaces

export interface JsonRpcError {
  message: string;
  code: string | number;
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
  magic_auth_login_with_magic_link = 'magic_auth_login_with_magic_link',
  magic_auth_get_access_token = 'magic_auth_get_access_token',
  magic_auth_get_metadata = 'magic_auth_get_metadata',
  magic_auth_logout = 'magic_auth_logout',
}
