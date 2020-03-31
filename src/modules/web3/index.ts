/* eslint-disable no-param-reassign */

import { BaseModule } from '../base-module';
import {
  JsonRpcRequestPayload,
  JsonRpcRequestCallback,
  MagicOutgoingWindowMessage,
  JsonRpcBatchRequestCallback,
} from '../../types';
import { getPayloadId } from '../../util/get-payload-id';
import { createInvalidArgumentError, MagicRPCError } from '../../core/sdk-exceptions';
import { createJsonRpcRequestPayload } from '../../core/json-rpc';

export class Web3Module extends BaseModule {
  // Implement a EIP-1193 compliant Web3 provider...
  // @see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md

  public readonly isMagic = true;

  public async sendAsync(
    payload: Partial<JsonRpcRequestPayload>,
    onRequestComplete: JsonRpcRequestCallback,
  ): Promise<void>;
  public async sendAsync(
    payload: Partial<JsonRpcRequestPayload>[],
    onRequestComplete: JsonRpcBatchRequestCallback,
  ): Promise<void>;
  public async sendAsync(
    payload: Partial<JsonRpcRequestPayload> | Partial<JsonRpcRequestPayload>[],
    onRequestComplete: JsonRpcRequestCallback | JsonRpcBatchRequestCallback,
  ): Promise<void> {
    if (!onRequestComplete) {
      throw createInvalidArgumentError({
        functionName: 'Magic.web3.sendAsync',
        argIndex: 1,
        expected: 'function',
        received: onRequestComplete === null ? 'null' : typeof onRequestComplete,
      });
    }

    if (Array.isArray(payload)) {
      const batchResponse = await this.transport.post(
        this.overlay,
        MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST,
        payload.map(p => {
          p.jsonrpc = '2.0';
          p.id = getPayloadId();
          return p;
        }) as JsonRpcRequestPayload[],
      );

      (onRequestComplete as JsonRpcBatchRequestCallback)(
        null,
        batchResponse.map(response => ({
          ...response.payload,
          error: response.hasError ? new MagicRPCError(response.payload.error) : null,
        })),
      );
    } else {
      payload.jsonrpc = '2.0';
      payload.id = getPayloadId();

      const response = await this.transport.post(
        this.overlay,
        MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST,
        payload as JsonRpcRequestPayload,
      );

      (onRequestComplete as JsonRpcRequestCallback)(
        response.hasError ? new MagicRPCError(response.payload.error) : null,
        response.payload,
      );
    }
  }

  public enable() {
    const requestPayload = createJsonRpcRequestPayload('eth_accounts');
    return this.request<string>(requestPayload);
  }
}
