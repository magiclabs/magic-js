import { JsonRpcResponse } from '../core/json-rpc';
import { JsonRpcRequestPayload, MagicMessageEvent } from '@magic-sdk/types';
import { getItem, setItem } from './storage';
import { SDKEnvironment } from '../core/sdk-environment';
import { getDecryptedDeviceShare } from './device-share-web-crypto';
import { createJwt } from './web-crypto';

interface StandardizedResponse {
  id?: string | number;
  response?: JsonRpcResponse;
}

interface StandardizedMagicRequest {
  msgType: string;
  payload: JsonRpcRequestPayload | JsonRpcRequestPayload[];
  jwt?: string;
  rt?: string;
  deviceShare?: string;
}

/**
 * Get the originating payload from a batch request using the specified `id`.
 */
export function getRequestPayloadFromBatch(
  requestPayload: JsonRpcRequestPayload | JsonRpcRequestPayload[],
  id?: string | number | null,
): JsonRpcRequestPayload | undefined {
  return id && Array.isArray(requestPayload)
    ? requestPayload.find(p => p.id === id)
    : (requestPayload as JsonRpcRequestPayload);
}

/**
 * Ensures the incoming response follows the expected schema and parses for a
 * JSON RPC payload ID.
 */
export function standardizeResponse(
  requestPayload: JsonRpcRequestPayload | JsonRpcRequestPayload[],
  event: MagicMessageEvent,
): StandardizedResponse {
  const id = event.data.response?.id;
  const requestPayloadResolved = getRequestPayloadFromBatch(requestPayload, id);

  if (id && requestPayloadResolved) {
    // Build a standardized response object
    const response = new JsonRpcResponse(requestPayloadResolved)
      .applyResult(event.data.response.result)
      .applyError(event.data.response.error);

    return { id, response };
  }

  return {};
}

export async function createMagicRequest(
  msgType: string,
  payload: JsonRpcRequestPayload | JsonRpcRequestPayload[],
  networkHash: string,
) {
  const rt = await getItem<string>('rt');
  let jwt;

  // only for webcrypto platforms
  if (SDKEnvironment.platform === 'web') {
    try {
      jwt = (await getItem<string>('jwt')) ?? (await createJwt());
    } catch (e) {
      console.error('webcrypto error', e);
    }
  }

  const request: StandardizedMagicRequest = { msgType, payload };

  if (jwt) {
    request.jwt = jwt;
  }
  if (jwt && rt) {
    request.rt = rt;
  }

  // Grab the device share if it exists for the network
  const decryptedDeviceShare = await getDecryptedDeviceShare(networkHash);
  if (decryptedDeviceShare) {
    request.deviceShare = decryptedDeviceShare;
  }

  return request;
}

export async function persistMagicEventRefreshToken(event: MagicMessageEvent) {
  if (!event.data.rt) {
    return;
  }

  await setItem('rt', event.data.rt);
}

export function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
