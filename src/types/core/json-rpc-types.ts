// --- Request interfaces

export interface JsonRpcRequestPayload {
  jsonrpc: string;
  method: string;
  params: any[];
  id: string | number;
}

export interface JsonRpcBatchRequestPayload {
  jsonrpc: string;
  method: string;
  batch: JsonRpcRequestPayload[];
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
 * Enum of Fortmatic custom JSON RPC methods. These are used for communication
 * with the Fortmatic provider and as such are not part of the Web3 standard
 * spec.
 */
export enum MagicPayloadMethod {
  magic_auth_login_with_magic_link = 'fm_auth_login_with_magic_link',
  magic_auth_get_access_token = 'fm_auth_get_access_token',
  magic_auth_get_metadata = 'fm_auth_get_metadata',
  magic_auth_logout = 'fm_auth_logout',
}
