function percentToByte(p: string) {
  return String.fromCharCode(parseInt(p.slice(1), 16));
}

function byteToPercent(b: string) {
  return `%${`00${b.charCodeAt(0).toString(16)}`.slice(-2)}`;
}

/**
 * Encodes a Base64 string. Safe for UTF-8 characters.
 * Original source is from the `universal-base64` NPM package.
 *
 * @source https://github.com/blakeembrey/universal-base64/blob/master/src/browser.ts
 */
function btoaUTF8(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%[0-9A-F]{2}/g, percentToByte));
}

/**
 * Decodes a Base64 string. Safe for UTF-8 characters.
 * Original source is from the `universal-base64` NPM package.
 *
 * @source https://github.com/blakeembrey/universal-base64/blob/master/src/browser.ts
 */
function atobUTF8(str: string): string {
  return decodeURIComponent(Array.from(atob(str), byteToPercent).join(''));
}

/**
 * Given a JSON-serializable object, encode as a Base64 string.
 */
export function encodeJSON<T>(options: T): string {
  return btoaUTF8(JSON.stringify(options));
}

/**
 * Given a Base64 JSON string, decode a JavaScript object.
 */
export function decodeJSON<T>(queryString: string): T {
  return JSON.parse(atobUTF8(queryString));
}
