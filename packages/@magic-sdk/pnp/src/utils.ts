import { PlugNPlayExtension } from './pnp-extension';
import type { Magic, OAuthExtension } from './types';

export function createMagicInstance(apiKey?: string, endpoint?: string): Magic<[PlugNPlayExtension, OAuthExtension]> {
  const extensions = removeFalsey([
    new PlugNPlayExtension(),
    window.MagicOAuthExtension && new window.MagicOAuthExtension(),
  ]);

  return new window.Magic(apiKey!, {
    endpoint,
    extensions,
  });
}

export function removeFalsey<T>(arr: T[]): Array<NonNullable<T>> {
  return arr.filter(Boolean) as unknown as Array<NonNullable<T>>;
}

const allPossiblePNPScripts = document.querySelectorAll('script[data-magic-publishable-api-key]');
const thisScript = (document.currentScript ??
  allPossiblePNPScripts[allPossiblePNPScripts.length - 1]) as HTMLScriptElement;

export function getScriptData() {
  const src = new URL(thisScript.getAttribute('src')!);
  const apiKey = thisScript.dataset.magicPublishableApiKey;
  const redirectURI = thisScript.dataset.redirectUri;
  const debug = !!thisScript.dataset.debug;

  return { script: thisScript, src, apiKey, redirectURI, debug };
}

export type ScriptData = ReturnType<typeof getScriptData>;
