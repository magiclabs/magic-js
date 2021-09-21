import type Magic from 'magic-sdk/dist/types/index.cdn';
import type OAuthExtension from '@magic-ext/oauth/dist/es/index.cdn';

declare global {
  interface Window {
    Magic: typeof Magic;
    MagicOAuthExtension?: typeof OAuthExtension;
  }
}

class PlugNPlayExtension extends window.Magic.Extension.Internal<'pnp', { isPnP: boolean }> {
  config = { isPnP: true };
  name = 'pnp' as const;

  getLoginMethod() {
    return this.request(this.utils.createJsonRpcRequestPayload('pnp/login'));
  }
}

function removeFalsey<T>(arr: T[]): Array<NonNullable<T>> {
  return arr.filter(Boolean) as unknown as Array<NonNullable<T>>;
}

function createMagicInstance(apiKey?: string, endpoint?: string) {
  const extensions = removeFalsey([
    new PlugNPlayExtension(),
    window.MagicOAuthExtension && new window.MagicOAuthExtension(),
  ]);

  return new window.Magic(apiKey!, {
    endpoint,
    extensions,
  });
}

async function initiatePNPLogin(): Promise<void> {
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

if (['loaded', 'interactive', 'complete'].includes(document.readyState)) {
  initiatePNPLogin();
} else {
  window.addEventListener('load', initiatePNPLogin, true);
}
