import type { Magic } from 'magic-sdk/dist/types/index';
import type OAuthExtension from '@magic-ext/oauth/dist/types/index.cdn';
import type CDNMagic from 'magic-sdk/dist/types/index.cdn';

declare global {
  interface Window {
    Magic: typeof CDNMagic;
    MagicOAuthExtension?: typeof OAuthExtension;
  }
}

export type { Magic, OAuthExtension };
