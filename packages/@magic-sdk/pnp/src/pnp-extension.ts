export class PlugNPlayExtension extends window.Magic.Extension.Internal<'pnp', { isPnP: boolean }> {
  config = { isPnP: true };
  name = 'pnp' as const;

  static storageKeys = {
    lastUsedProvider: 'pnp/lastUsedProvider',
  };

  getLoginMethod() {
    return this.utils.createPromiEvent<[string, string | undefined], { yolo: () => void }>(async (resolve) => {
      const lastUsedProvider = await this.utils.storage.getItem<string | undefined>(
        PlugNPlayExtension.storageKeys.lastUsedProvider,
      );

      resolve(await this.request(this.utils.createJsonRpcRequestPayload('pnp/login', [{ lastUsedProvider }])));
    });
  }

  async saveLastUsedProvider(provider?: string) {
    if (provider) {
      await this.utils.storage.setItem(PlugNPlayExtension.storageKeys.lastUsedProvider, provider);
    }
  }
}
