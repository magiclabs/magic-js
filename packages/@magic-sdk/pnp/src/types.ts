import type { SDKBase, InstanceWithExtensions, MagicSDKExtensionsOption } from '@magic-sdk/provider';
import type { OAuthExtension } from '@magic-ext/oauth2';

export type Magic<TExtensions extends MagicSDKExtensionsOption = MagicSDKExtensionsOption> = InstanceWithExtensions<
  SDKBase,
  TExtensions
>;
export type { OAuthExtension };
