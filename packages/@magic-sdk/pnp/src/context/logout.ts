import { createMagicInstance, getScriptData } from '../utils';

export async function logout(): Promise<void> {
  const { src, apiKey, redirectURI = window.location.origin } = getScriptData();
  const magic = createMagicInstance(apiKey, src.origin);
  await magic.user.logout().catch(() => {});
  window.location.href = redirectURI;
}
