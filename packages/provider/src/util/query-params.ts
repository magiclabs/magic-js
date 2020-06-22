import { QueryParameters } from '@magic-sdk/types';

export function encodeQueryParameters<T = QueryParameters>(options: T): string {
  return btoa(JSON.stringify(options));
}

export function decodeQueryParameters<T = QueryParameters>(queryString: string): T {
  return JSON.parse(atob(queryString));
}
