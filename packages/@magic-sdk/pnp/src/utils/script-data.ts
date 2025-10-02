const allPossiblePNPScripts = document.querySelectorAll('script[data-magic-publishable-api-key]');
const thisScript = (document.currentScript ??
  allPossiblePNPScripts[allPossiblePNPScripts.length - 1]) as HTMLScriptElement;

export function getScriptData() {
  const src = new URL(thisScript.getAttribute('src')!);

  // Values derived from `data-*` attributes
  const apiKey = thisScript.dataset.magicPublishableApiKey;
  const locale = thisScript.dataset.locale;
  const redirectURI = getAbsoluteURL(thisScript.dataset.redirectUri);
  const loginURI = getAbsoluteURL(thisScript.dataset.loginUri);
  const termsOfServiceURI = getAbsoluteURL(thisScript.dataset.termsOfServiceUri);
  const privacyPolicyURI = getAbsoluteURL(thisScript.dataset.privacyPolicyUri);
  const debug = !!thisScript.dataset.debug;

  return {
    script: thisScript,
    src,
    apiKey,
    locale,
    redirectURI,
    loginURI,
    termsOfServiceURI,
    privacyPolicyURI,
    debug,
  };
}

export type ScriptData = ReturnType<typeof getScriptData>;

/**
 * Resolve `relativeURL` to an absolute path against current origin by
 * (naively) checking if `relativeURL` starts with "/".
 */
function getAbsoluteURL(relativeURL?: string) {
  if (relativeURL?.startsWith('/')) return `${window.location.origin}${relativeURL}`;
  return relativeURL;
}
