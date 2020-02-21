/**
 * The shape of encoded query parameters sent along with the `<iframe>` request.
 */
export interface QueryParameters {
  API_KEY?: string;
  DOMAIN_ORIGIN?: string;
  host?: string;
  sdk?: string;
  version?: string;
}

export function encodeQueryParameters(options: QueryParameters): string {
  return btoa(JSON.stringify(options));
}

export function decodeQueryParameters(queryString: string): QueryParameters {
  return JSON.parse(atob(queryString));
}
