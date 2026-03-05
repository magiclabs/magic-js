import { logger } from './logger';

const IDB_DB_NAME = 'magic_oauth_db';
const IDB_DB_VERSION = 1;
const IDB_STORE_NAME = 'pkce_store';

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
};

/**
 * Writes a value to sessionStorage, localStorage, and IndexedDB.
 * Failures in any individual layer are logged and swallowed so a single
 * unavailable store (e.g. private-browsing restrictions) does not block the flow.
 * Returns a result map indicating which layers succeeded.
 */
export async function storageWrite(key: string, value: string): Promise<StorageWriteResult> {
  const result: StorageWriteResult = { sessionStorage: false, localStorage: false, indexedDB: false };

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

  return result;
}

export type StorageSource = 'sessionStorage' | 'localStorage' | 'indexedDB' | null;

/**
 * Reads a value from sessionStorage first, then localStorage, then IndexedDB.
 * Returns the first non-null hit (or null) along with which layer it came from.
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
    return { value: fromIdb, source: fromIdb !== null ? 'indexedDB' : null };
  } catch (err) {
    logger.error('oauth2.storage.read_failed', {
      storage: { layer: 'indexedDB', key, errorMsg: err instanceof Error ? err.message : String(err) },
    });
    return { value: null, source: null };
  }
}

/**
 * Removes a key from sessionStorage, localStorage, and IndexedDB.
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
}
