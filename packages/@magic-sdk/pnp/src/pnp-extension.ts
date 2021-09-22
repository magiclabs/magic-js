export class PlugNPlayExtension extends window.Magic.Extension.Internal<'pnp', { isPnP: boolean }> {
  config = { isPnP: true };
  name = 'pnp' as const;

  getLoginMethod() {
    return this.request(this.utils.createJsonRpcRequestPayload('pnp/login'));
  }
}
