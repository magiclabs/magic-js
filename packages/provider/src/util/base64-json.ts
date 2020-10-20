import { QueryParameters } from '@magic-sdk/types';
import { createDeprecationWarning } from '../core/sdk-exceptions';

/**
 * Given a JSON-serializable object, encode as a Base64 string.
 */
export function encodeJSON<T>(options: T): string {
  return btoa(JSON.stringify(options));
}

/**
 * Given a Base64 JSON string, decode a JavaScript object.
 */
export function decodeJSON<T>(queryString: string): T {
  return JSON.parse(atob(queryString));
}
