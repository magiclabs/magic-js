import { URL as PolyfillURL } from 'whatwg-url';

/**
 * Builds a `URL` object depending on the code environment (whether Browser or
 * React Native).
 */
export function createURL(url: string, base?: string): URL {
  // We only include the polyfill in the React Native-compatible bundle.
  // Otherwise, we strip out the `whatwg-url` dependency completely.
  if (PolyfillURL) {
    return (new PolyfillURL(url, base) as unknown) as URL;
  }

  // This line should only be reached in the CJS/CDN bundles.
  return new URL(url, base);
}
