import { getItem, iterate, removeItem, setItem } from './storage';
import { isWebCryptoSupported } from './web-crypto';

export const DEVICE_SHARE_KEY = 'ds';
export const ENCRYPTION_KEY_KEY = 'ek';
export const INITIALIZATION_VECTOR_KEY = 'iv';

const ALGO_NAME = 'AES-GCM'; // for encryption
const ALGO_LENGTH = 256;

export async function clearDeviceShares() {
  const keysToRemove: string[] = [];
  await iterate((value, key, iterationNumber) => {
    if (key.startsWith(`${DEVICE_SHARE_KEY}_`)) {
      keysToRemove.push(key);
    }
  });
  for (const key of keysToRemove) {
    // eslint-disable-next-line no-await-in-loop
    await removeItem(key);
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getOrCreateInitVector() {
  if (!isWebCryptoSupported()) {
    console.info('webcrypto is not supported');
    return undefined;
  }
  const { crypto } = window;
  const existingIv = (await getItem(INITIALIZATION_VECTOR_KEY)) as Uint8Array;
  if (existingIv) {
    return existingIv;
  }

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM
  return iv;
}

async function getOrCreateEncryptionKey() {
  if (!isWebCryptoSupported()) {
    console.info('webcrypto is not supported');
    return undefined;
  }
  const { subtle } = window.crypto;
  const existingKey = (await getItem(ENCRYPTION_KEY_KEY)) as CryptoKey;
  if (existingKey) {
    return existingKey;
  }

  const key = await subtle.generateKey(
    { name: ALGO_NAME, length: ALGO_LENGTH },
    false, // non-extractable
    ['encrypt', 'decrypt'],
  );
  return key;
}

export async function encryptAndPersistDeviceShare(deviceShareBase64: string, networkHash: string): Promise<void> {
  const iv = await getOrCreateInitVector();
  const encryptionKey = await getOrCreateEncryptionKey();

  if (!iv || !encryptionKey || !deviceShareBase64) {
    return;
  }
  const decodedDeviceShare = base64ToArrayBuffer(deviceShareBase64);

  const { subtle } = window.crypto;

  const encryptedData = await subtle.encrypt(
    {
      name: ALGO_NAME,
      iv,
    },
    encryptionKey,
    decodedDeviceShare,
  );

  // The encrypted device share we store is a base64 encoded string representation
  // of the magic kms encrypted client share encrypted with webcrypto
  const encryptedDeviceShare = arrayBufferToBase64(encryptedData);

  await setItem(`${DEVICE_SHARE_KEY}_${networkHash}`, encryptedDeviceShare);
  await setItem(ENCRYPTION_KEY_KEY, encryptionKey);
  await setItem(INITIALIZATION_VECTOR_KEY, iv);
}

export async function getDecryptedDeviceShare(networkHash: string): Promise<string | undefined> {
  const encryptedDeviceShare = await getItem<string>(`${DEVICE_SHARE_KEY}_${networkHash}`);
  const iv = (await getItem(INITIALIZATION_VECTOR_KEY)) as Uint8Array; // use existing encryption key and initialization vector
  const encryptionKey = (await getItem(ENCRYPTION_KEY_KEY)) as CryptoKey;

  if (!iv || !encryptedDeviceShare || !encryptionKey || !isWebCryptoSupported()) {
    return undefined;
  }

  const { subtle } = window.crypto;
  const ab = await subtle.decrypt({ name: ALGO_NAME, iv }, encryptionKey, base64ToArrayBuffer(encryptedDeviceShare));

  return arrayBufferToBase64(ab);
}
