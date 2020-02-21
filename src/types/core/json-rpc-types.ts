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
  id: string | number;
  result: ResultType | null;
  error: JsonRpcError | null;
}

// --- Miscellaneous

export interface JsonRpcRequestCallback {
  /**
   * Callback executed upon JSON RPC response.
   */
  (err: JsonRpcError | null, result?: JsonRpcResponsePayload | (JsonRpcResponsePayload | null)[] | null): void;
}

export interface ComposeTransactionConfig {
  to: string;
  amount: string;
}
