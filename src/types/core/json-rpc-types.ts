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
  LoginWithMagicLink = 'magic_auth_login_with_magic_link',
  GetAccessToken = 'magic_auth_get_access_token',
  GetMetadata = 'magic_auth_get_metadata',
  Logout = 'magic_auth_logout',
}
