import { MagicPayloadMethod } from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';

export class SettingsModule extends BaseModule {
  public enableMfa() {
    const requestPayload = createJsonRpcRequestPayload(
      this.sdk.testMode ? MagicPayloadMethod.EnableMfaTestMode : MagicPayloadMethod.EnableMfa,
    );
    return this.request<boolean>(requestPayload);
  }

  //   public disableMfa() {
  //     const requestPayload = createJsonRpcRequestPayload(
  //       this.sdk.testMode ? MagicPayloadMethod.DisableMfaTestMode : MagicPayloadMethod.DisableMfa,
  //     );
  //     return this.request<boolean>(requestPayload);
  //   }
}
