import { iterate, removeItem } from './storage';

const DEVICE_SHARE_KEY = 'ds';
const ENCRYPTION_KEY_KEY = 'ek';
const INITIALIZATION_VECTOR_KEY = 'iv';

/**
 * Split-key DKMS is retired, so the SDK no longer caches a device share. Wallets
 * that authenticated before the TEE migration may still hold the cached share
 * along with the AES key and IV it was encrypted under, so remove all three
 * wherever they are still present.
 */
export async function clearDeviceShares() {
  const keysToRemove: string[] = [ENCRYPTION_KEY_KEY, INITIALIZATION_VECTOR_KEY];
  await iterate((value, key) => {
    if (key.startsWith(`${DEVICE_SHARE_KEY}_`)) {
      keysToRemove.push(key);
    }
  });
  for (const key of keysToRemove) {
    await removeItem(key);
  }
}
