import { logger } from './logger';

const IDB_DB_NAME = 'magic_oauth_db';
const IDB_DB_VERSION = 1;
const IDB_STORE_NAME = 'pkce_store';

// Cookie TTL covers the OAuth round-trip with margin. Short enough to limit exposure.
const COOKIE_MAX_AGE_SECONDS = 600; // 10 minutes

/**
 * Cookies are the most iOS ITP-resilient storage primitive for PKCE data:
 *   - ITP only restricts *third-party* cookies. A cookie set on the app's own origin
 *     is first-party and is never touched by ITP.
 *   - SameSite=Lax allows the cookie to be sent on the top-level GET navigation that
 *     returns from the OAuth provider — the exact redirect we need to survive.
 *   - Cookies survive the ASWebAuthenticationSession ↔ WKWebView process boundary,
 *     whereas sessionStorage, localStorage, and IndexedDB do not cross that boundary.
 */
function cookieWrite(key: string, value: string): void {
  const encoded = encodeURIComponent(value);
  document.cookie = `${key}=${encoded}; SameSite=Lax; Secure; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}`;
}

function cookieRead(key: string): string | null {
  const prefix = `${key}=`;
  const match = document.cookie.split('; ').find((row) => row.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function cookieRemove(key: string): void {
  document.cookie = `${key}=; SameSite=Lax; Secure; Path=/; Max-Age=0`;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_DB_NAME, IDB_DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// These helpers intentionally throw — callers handle errors so they can log with context.

async function idbWrite(key: string, value: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
    tx.objectStore(IDB_STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbRead(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readonly');
    const request = tx.objectStore(IDB_STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as string) ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function idbRemove(key: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
    tx.objectStore(IDB_STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export type StorageWriteResult = {
  sessionStorage: boolean;
  localStorage: boolean;
  indexedDB: boolean;
  cookie: boolean;
};

/**
 * Writes a value to sessionStorage, localStorage, IndexedDB, and a first-party cookie.
 * Failures in any individual layer are logged and swallowed so a single
 * unavailable store (e.g. private-browsing restrictions) does not block the flow.
 * Returns a result map indicating which layers succeeded.
 */
export async function storageWrite(key: string, value: string): Promise<StorageWriteResult> {
  const result: StorageWriteResult = { sessionStorage: false, localStorage: false, indexedDB: false, cookie: false };

  try {
    sessionStorage.setItem(key, value);
    result.sessionStorage = true;
  } catch (err) {
    logger.error('oauth2.storage.write_failed', {
      storage: { layer: 'sessionStorage', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  try {
    localStorage.setItem(key, value);
    result.localStorage = true;
  } catch (err) {
    logger.error('oauth2.storage.write_failed', {
      storage: { layer: 'localStorage', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  try {
    await idbWrite(key, value);
    result.indexedDB = true;
  } catch (err) {
    logger.error('oauth2.storage.write_failed', {
      storage: { layer: 'indexedDB', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  try {
    cookieWrite(key, value);
    result.cookie = true;
  } catch (err) {
    logger.error('oauth2.storage.write_failed', {
      storage: { layer: 'cookie', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  return result;
}

export type StorageSource = 'sessionStorage' | 'localStorage' | 'indexedDB' | 'cookie' | null;

/**
 * Reads a value from sessionStorage, localStorage, IndexedDB, then cookie — first non-null wins.
 * The cookie layer is the most reliable on iOS (ITP-safe, survives ASWebAuthenticationSession).
 * Returns the value along with which layer it came from.
 */
export async function storageRead(key: string): Promise<{ value: string | null; source: StorageSource }> {
  try {
    const fromSession = sessionStorage.getItem(key);
    if (fromSession !== null) return { value: fromSession, source: 'sessionStorage' };
  } catch (err) {
    logger.error('oauth2.storage.read_failed', {
      storage: { layer: 'sessionStorage', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal !== null) return { value: fromLocal, source: 'localStorage' };
  } catch (err) {
    logger.error('oauth2.storage.read_failed', {
      storage: { layer: 'localStorage', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  try {
    const fromIdb = await idbRead(key);
    if (fromIdb !== null) return { value: fromIdb, source: 'indexedDB' };
  } catch (err) {
    logger.error('oauth2.storage.read_failed', {
      storage: { layer: 'indexedDB', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  try {
    const fromCookie = cookieRead(key);
    if (fromCookie !== null) return { value: fromCookie, source: 'cookie' };
  } catch (err) {
    logger.error('oauth2.storage.read_failed', {
      storage: { layer: 'cookie', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  return { value: null, source: null };
}

/**
 * Removes a key from sessionStorage, localStorage, IndexedDB, and the cookie.
 */
export async function storageRemove(key: string): Promise<void> {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    logger.error('oauth2.storage.remove_failed', {
      storage: { layer: 'sessionStorage', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  try {
    localStorage.removeItem(key);
  } catch (err) {
    logger.error('oauth2.storage.remove_failed', {
      storage: { layer: 'localStorage', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  try {
    await idbRemove(key);
  } catch (err) {
    logger.error('oauth2.storage.remove_failed', {
      storage: { layer: 'indexedDB', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }

  try {
    cookieRemove(key);
  } catch (err) {
    logger.error('oauth2.storage.remove_failed', {
      storage: { layer: 'cookie', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }
}
