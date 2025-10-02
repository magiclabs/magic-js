import { PlugNPlayExtension } from '../pnp-extension';
import type { Magic, OAuthExtension } from '../types';

export function createMagicInstance(
  apiKey?: string,
  endpoint?: string,
  locale?: string,
): Magic<[PlugNPlayExtension, OAuthExtension]> {
  const extensions = removeFalsey([
    new PlugNPlayExtension(),
    window.MagicOAuthExtension && new window.MagicOAuthExtension(),
  ]);

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
