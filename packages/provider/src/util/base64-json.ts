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

// --- DEPRECATED!

/**
 * Given a JSON-serializable object, encode as a Base64 string.
 *
 * @deprecated
 */
/* istanbul ignore next */
export function encodeQueryParameters<T = QueryParameters>(options: T): string {
  createDeprecationWarning({
    method: 'encodeQueryParameters()',
    removalVersions: { 'magic-sdk': 'v3.0.0', '@magic-sdk/react-native': 'v3.0.0' },
    useInstead: 'encodeJSON()',
  }).log();

  return btoa(JSON.stringify(options));
}

/**
 * Given a Base64 JSON string, decode a JavaScript object.
 *
 * @deprecated
 */
/* istanbul ignore next */
export function decodeQueryParameters<T = QueryParameters>(queryString: string): T {
  createDeprecationWarning({
    method: 'decodeQueryParameters()',
    removalVersions: { 'magic-sdk': 'v3.0.0', '@magic-sdk/react-native': 'v3.0.0' },
    useInstead: 'decodeJSON()',
  }).log();

  return JSON.parse(atob(queryString));
}
