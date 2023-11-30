const ALGO_NAME = 'AES-GCM'; // for encryption
const ALGO_LENGTH = 256;

function strToArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function bufferToString(buffer: ArrayBuffer) {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}

async function createInitializationVector() {
  const { crypto } = window;

  if (!crypto) return undefined;

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM
  return iv;
}

async function createEncryptionKey() {
  const { subtle } = window.crypto;
  if (!subtle) return undefined;
  const key = subtle.generateKey(
    { name: ALGO_NAME, length: ALGO_LENGTH },
    false, // non-extractable
    ['encrypt', 'decrypt'],
  );
  return key;
}

export async function encryptDeviceShare(data: string): Promise<any> {
  // generate new iv
  const iv = await createInitializationVector();
  const encryptionKey = await createEncryptionKey();

  if (!iv || !encryptionKey) return { iv: undefined, encryptionKey: undefined, deviceShare: undefined };

  const deviceShare = await window.crypto.subtle.encrypt(
    {
      name: ALGO_NAME,
      iv,
    },
    encryptionKey,
    strToArrayBuffer(data),
  );

  return { encryptionKey, deviceShare, iv };
}

export async function decryptDeviceShare(
  encryptedDeviceShare: string,
  encryptionKey: CryptoKey,
  ivString: string,
): Promise<string | undefined> {
  if (!encryptedDeviceShare) {
    return undefined;
  }

  const iv = new Uint8Array(ivString.split(',').map(Number));
  const { subtle } = window.crypto;

  if (!iv || !encryptedDeviceShare || !encryptionKey || !subtle) return undefined;

  const ab = await subtle.decrypt({ name: ALGO_NAME, iv }, encryptionKey, strToArrayBuffer(encryptedDeviceShare));

  return bufferToString(ab);
}
