import { QueryParameters } from '@magic-sdk/types';

export function encodeQueryParameters(options: QueryParameters): string {
  return btoa(JSON.stringify(options));
}
