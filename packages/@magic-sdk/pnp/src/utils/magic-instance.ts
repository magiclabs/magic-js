import { PlugNPlayExtension } from '../pnp-extension';
import type { Magic, OAuthExtension } from '../types';
import { OAuthExtension as OAuth2Extension } from '@magic-ext/oauth2';

declare global {
  interface Window {
    Magic: any; // Magic constructor from magic-sdk
    MagicOAuthExtension?: typeof OAuthExtension;
  }
}

export function createMagicInstance(
  apiKey?: string,
  endpoint?: string,
  locale?: string,
): Magic<[PlugNPlayExtension, OAuthExtension]> {
  const extensions = removeFalsey([new PlugNPlayExtension(), new OAuth2Extension()]);

  return new window.Magic(apiKey!, {
    endpoint,
    locale: locale as any, // locale is strongly-typed as exact strings, so we have to cast to any here.
    extensions,
  });
}

export type PNPMagicInstance = ReturnType<typeof createMagicInstance>;

function removeFalsey<T>(arr: T[]): Array<NonNullable<T>> {
  return arr.filter(Boolean) as unknown as Array<NonNullable<T>>;
}
