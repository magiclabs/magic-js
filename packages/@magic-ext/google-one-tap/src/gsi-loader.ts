import type { GoogleAccountsId } from './google-types';

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const LOAD_TIMEOUT_MS = 10_000;

let gsiPromise: Promise<GoogleAccountsId> | null = null;

/**
 * Lazily inject the Google Identity Services script into the host page and resolve
 * with `window.google.accounts.id` once it is available.
 *
 * Single-flight: concurrent or repeated calls share one in-flight promise and one
 * `<script>` tag. If a previous attempt failed, the cached rejection is cleared so
 * a subsequent call retries from scratch.
 */
export const loadGsi = (): Promise<GoogleAccountsId> => {
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('Google One Tap requires a browser environment.'));
      return;
    }

    if (window.google?.accounts?.id) {
      resolve(window.google.accounts.id);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      reject(new Error(`Timed out waiting for Google Identity Services to load (${LOAD_TIMEOUT_MS}ms).`));
    }, LOAD_TIMEOUT_MS);

    const finish = (err?: Error) => {
      window.clearTimeout(timeoutId);
      if (err) {
        reject(err);
        return;
      }
      const accountsId = window.google?.accounts?.id;
      if (!accountsId) {
        reject(new Error('Google Identity Services script loaded but window.google.accounts.id is missing.'));
        return;
      }
      resolve(accountsId);
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`);
    if (existing) {
      // Some other code on the page already requested GSI; piggy-back on its load event.
      // If the script already finished loading, `finish()` resolves synchronously.
      if (window.google?.accounts?.id) {
        finish();
        return;
      }
      existing.addEventListener('load', () => finish(), { once: true });
      existing.addEventListener('error', () => finish(new Error('Failed to load Google Identity Services script.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => finish();
    script.onerror = () => finish(new Error('Failed to load Google Identity Services script.'));
    document.head.appendChild(script);
  }).catch(err => {
    // Clear the cached failure so a later call can retry (e.g. transient network).
    gsiPromise = null;
    throw err;
  });

  return gsiPromise;
};

/**
 * Test-only hook to drop the cached promise. Not exported from the package entry point.
 */
export const __resetGsiLoaderForTests = () => {
  gsiPromise = null;
};
