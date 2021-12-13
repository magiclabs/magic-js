import { getScriptData } from '../utils/script-data';
import { createMagicInstance } from '../utils/magic-instance';

export async function logout(): Promise<void> {
  // In this context, `loginURI` and `redirectURI` are the same.
  // We simply need a location to redirect to after attempting to logout.
  const { src, apiKey, locale, loginURI, redirectURI = window.location.origin } = getScriptData();
  const magic = createMagicInstance(apiKey, src.origin, locale);
  await magic.user.logout().catch(() => {});
  window.location.href = loginURI || redirectURI;
}
