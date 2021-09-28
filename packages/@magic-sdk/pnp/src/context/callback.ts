import { createMagicInstance, getScriptData } from '../utils';

export async function callback(): Promise<void> {
  const { src, apiKey } = getScriptData();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const isOAuthCallback = !!urlParams.get('state');
  const isMagicLinkRedirectCallback = !isOAuthCallback && !!urlParams.get('magic_credential');

  const magic = createMagicInstance(apiKey, src.origin);

  function clearURLQuery() {
    const urlWithoutQuery = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', urlWithoutQuery);
  }

  function dispatchReadyEvent(data: any) {
    const evt = new CustomEvent('@magic/ready', { detail: { magic, ...data } });
    window.dispatchEvent(evt);
  }

  async function handleOAuthCallback() {
    const res = await magic.oauth.getRedirectResult();
    dispatchReadyEvent({ idToken: res.magic.idToken, userMetadata: res.magic.userMetadata, oauth: res.oauth });
  }

  async function handleMagicLinkRedirectCallback() {
    const idToken = await magic.auth.loginWithCredential();
    const userMetadata = await magic.user.getMetadata();
    dispatchReadyEvent({ idToken, userMetadata });
  }

  async function handleMagicLinkCallback() {
    const idToken = urlParams.get('didt') || (await magic.user.getIdToken());
    clearURLQuery();
    const userMetadata = await magic.user.getMetadata();
    dispatchReadyEvent({ idToken: decodeURIComponent(idToken), userMetadata });
  }

  if (isOAuthCallback) {
    await handleOAuthCallback().catch(() => {});
  } else if (isMagicLinkRedirectCallback) {
    await handleMagicLinkRedirectCallback().catch(() => {});
  } else {
    await handleMagicLinkCallback().catch(() => {});
  }
}
