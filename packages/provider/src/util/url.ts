/**
 * Builds a `URL` object safely.
 */
export function createURL(url: string, base?: string): URL {
  // Safari raises an error if `undefined` is given to the second argument of
  // the `URL` constructor.
  return base ? new URL(url, base) : new URL(url);
}
