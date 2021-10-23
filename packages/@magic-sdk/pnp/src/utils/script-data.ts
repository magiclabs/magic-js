const allPossiblePNPScripts = document.querySelectorAll('script[data-magic-publishable-api-key]');
const thisScript = (document.currentScript ??
  allPossiblePNPScripts[allPossiblePNPScripts.length - 1]) as HTMLScriptElement;

export function getScriptData() {
  const src = new URL(thisScript.getAttribute('src')!);
  const apiKey = thisScript.dataset.magicPublishableApiKey;
  const debug = !!thisScript.dataset.debug;
  const redirectURI = getAbsoluteURL(thisScript.dataset.redirectUri);
  const loginURI = getAbsoluteURL(thisScript.dataset.loginUri);

  return { script: thisScript, src, apiKey, redirectURI, loginURI, debug };
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
