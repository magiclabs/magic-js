/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { createMagicInstance } from './utils';

export async function initiatePNPLogin(): Promise<void> {
  const thisScript = document.querySelector('script[data-magic-publishable-api-key]') as HTMLScriptElement;
  const src = new URL(thisScript.getAttribute('src')!);
  const apiKey = thisScript.dataset.magicPublishableApiKey;
  const redirectURI = thisScript.dataset.redirectUri || `${window.location.origin}/callback`;

  const magic = createMagicInstance(apiKey, src.origin);

  async function handleOAuthLogin(provider: any) {
    await magic.oauth.loginWithRedirect({ provider, redirectURI });
  }

  async function handleEmailLinkLogin(email: any) {
    const didt = await magic.auth.loginWithMagicLink({ email, redirectURI });
    window.location.href = `${redirectURI}?didt=${encodeURIComponent(didt!)}`;
  }

  const [loginType, arg] = await magic.pnp.getLoginMethod();

  switch (loginType) {
    case 'oauth':
      return handleOAuthLogin(arg).catch(initiatePNPLogin);

    case 'email-link':
      return handleEmailLinkLogin(arg).catch(initiatePNPLogin);

    default:
      return initiatePNPLogin();
  }
}
