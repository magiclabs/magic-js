import { getScriptData } from '../utils/script-data';
import { createMagicInstance } from '../utils/magic-instance';
import { dispatchReadyEvent } from '../utils/events';

export async function callback(): Promise<void> {
  // In this context, `loginURI` and `redirectURI` are the same.
  // We simply need a location to redirect to upon callback failure.
  const { src, apiKey, locale, loginURI, redirectURI = window.location.origin } = getScriptData();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const magic = createMagicInstance(apiKey, src.origin, locale);

  function clearURLQuery() {
    const urlWithoutQuery = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', urlWithoutQuery);
  }

  async function handleOAuthCallback() {
    const res = await magic.oauth.getRedirectResult();
    dispatchReadyEvent(magic, {
      idToken: res.magic.idToken,
      userMetadata: res.magic.userMetadata,
      oauth: res.oauth,
    });
  }

  async function handleMagicLinkRedirectCallback() {
    const idToken = await magic.auth.loginWithCredential();
    const userMetadata = await magic.user.getMetadata();
    dispatchReadyEvent(magic, { idToken, userMetadata });
  }

  async function handleSettingsCallback() {
    const idToken = await magic.user.getIdToken();
    const prevUserMetadata = magic.pnp.decodeUserMetadata(urlParams.get('prev_user_metadata')) ?? undefined;
    const currUserMetadata =
      magic.pnp.decodeUserMetadata(urlParams.get('curr_user_metadata')) ?? (await magic.user.getMetadata());
    clearURLQuery();
    dispatchReadyEvent(magic, { idToken, userMetadata: currUserMetadata, prevUserMetadata });
  }

  /**
   * Generically handles auth callback for methods where
   * a redirect in not applicable. Examples include:
   *
   * - SMS login
   * - Magic link login w/o `redirectURI`
   * - WebAuthn login
   * - Cases where the user has landed direclty
   *   on the callback page without a redirect
   */
  async function handleGenericCallback() {
    const idToken = urlParams.get('didt') || (await magic.user.getIdToken());
    clearURLQuery();
    const userMetadata = await magic.user.getMetadata();
    dispatchReadyEvent(magic, { idToken: decodeURIComponent(idToken), userMetadata });
  }

  const redirectToLoginURI = () => {
    window.location.href = loginURI || redirectURI;
  };

  switch (getCallbackType(urlParams)) {
    case 'oauth':
      return handleOAuthCallback().catch(redirectToLoginURI);

    case 'magic_credential':
      return handleMagicLinkRedirectCallback().catch(redirectToLoginURI);

    case 'settings':
      return handleSettingsCallback().catch(redirectToLoginURI);

    default:
      return handleGenericCallback().catch(redirectToLoginURI);
  }
}

type CallbackType = 'oauth' | 'magic_credential' | 'settings';

function getCallbackType(urlParams: URLSearchParams): CallbackType | null {
  if (urlParams.get('state')) {
    return 'oauth';
  }

  if (urlParams.get('magic_credential')) {
    return 'magic_credential';
  }

  if (urlParams.get('prev_user_metadata')) {
    return 'settings';
  }

  return null;
}
