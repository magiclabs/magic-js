import type { MagicUserMetadata } from '@magic-sdk/types';

export class PlugNPlayExtension extends window.Magic.Extension.Internal<'pnp', { isPnP: boolean }> {
  config = { isPnP: true };
  name = 'pnp' as const;

  public static storageKeys = {
    lastUsedProvider: 'pnp/lastUsedProvider',
  };

  public getLoginMethod(options: { debug?: boolean; termsOfServiceURI?: string; privacyPolicyURI?: string }) {
    return this.utils.createPromiEvent<[string, string | undefined]>(async (resolve) => {
      const lastUsedProvider = await this.utils.storage.getItem<string | undefined>(
        PlugNPlayExtension.storageKeys.lastUsedProvider,
      );

      resolve(
        await this.request(this.utils.createJsonRpcRequestPayload('pnp/login', [{ lastUsedProvider, ...options }])),
      );
    });
  }

  public showSettings() {
    return this.request(this.utils.createJsonRpcRequestPayload('pnp/settings'));
  }

  public async saveLastUsedProvider(provider?: string) {
    if (provider) {
      await this.utils.storage.setItem(PlugNPlayExtension.storageKeys.lastUsedProvider, provider);
    }
  }

  public encodeUserMetadata(userMetadata: MagicUserMetadata) {
    return this.utils.encodeJSON(userMetadata);
  }

  public decodeUserMetadata(userMetadataQueryString?: string | null): MagicUserMetadata | null {
    if (!userMetadataQueryString) return null;
    return this.utils.decodeJSON(userMetadataQueryString);
  }
}
