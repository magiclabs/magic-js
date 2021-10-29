import { getScriptData } from '../utils/script-data';
import { createMagicInstance } from '../utils/magic-instance';

export async function settings(): Promise<void> {
  // In this context, `loginURI` and `redirectURI` have distinct purposes.
  // `loginURI` is the location we redirect to when calling into settings fails.
  // `redirectURI` is the location we redirect to after the user has dismissed the settings page.
  const {
    src,
    apiKey,
    locale,
    redirectURI = `${window.location.origin}/callback`,
    loginURI = window.location.origin,
  } = getScriptData();

  const magic = createMagicInstance(apiKey, src.origin, locale);

  try {
    const prevUserMetadata = magic.pnp.encodeUserMetadata(await magic.user.getMetadata());
    const currUserMetadata = magic.pnp.encodeUserMetadata(await magic.pnp.showSettings());
    window.location.href = `${redirectURI}?prev_user_metadata=${prevUserMetadata}&curr_user_metadata=${currUserMetadata}`;
  } catch {
    window.location.href = loginURI;
  }
}
