import { webSafeImports } from '../web-safe-imports';

/**
 * Builds a `URL` object depending on the code environment (whether Browser or
 * React Native).
 */
export function createURL(url: string, base?: string): URL {
  // We only include the polyfill in the React Native-compatible bundle.
  // Otherwise, we strip out the `whatwg-url` dependency completely.
  /* istanbul ignore next */
  if (webSafeImports.url.URL) {
    return (base
      ? (new webSafeImports.url.URL(url, base) as unknown)
      : (new webSafeImports.url.URL(url) as unknown)) as URL;
  }

  // This line should only be reached in the CJS/CDN bundles.
  return base ? new URL(url, base) : new URL(url);
}
