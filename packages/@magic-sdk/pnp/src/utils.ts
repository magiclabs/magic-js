import { PlugNPlayExtension } from './pnp-extension';
import { Magic, OAuthExtension } from './types';

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
