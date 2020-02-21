import { FmProvider } from '../core/fm-provider';
import { JsonRpcRequestPayload, JsonRpcResponsePayload } from '../types';
import { createJsonRpcRequestPayload } from './json-rpc-helpers';

/**
 * Emit a payload to the provider asynchronously using native JavaScript
 * Promises.
 */
export function emitWeb3Payload<ResultType = any>(
  provider: FmProvider,
  method: string,
  params: any[] = [],
): Promise<ResultType> {
  return new Promise((resolve, reject) => {
    provider.sendAsync(createJsonRpcRequestPayload(method, params), (error, rpcResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve((rpcResponse! as JsonRpcResponsePayload).result);
      }
    });
  });
}

/**
 * Emit a custom Formatic payload asynchronously using native JavaScript
 * Promises.
 */
export function emitFortmaticPayload<ResultType = any>(
  provider: FmProvider,
  payload: JsonRpcRequestPayload,
): Promise<ResultType> {
  return new Promise((resolve, reject) => {
    provider.sendFortmaticAsync(payload, (error: any, response: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(response ? response.result : {});
      }
    });
  });
}
