import {
  GetIdTokenConfiguration,
  MagicPayloadMethod,
  MagicUserMetadata,
  GenerateIdTokenConfiguration,
  UpdateEmailConfiguration,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';

type UpdateEmailEvents = {
  'email-sent': () => void;
  'email-not-deliverable': () => void;
  'old-email-confirmed': () => void;
  'new-email-confirmed': () => void;
  retry: () => void;
};

export class TestingUserModule extends BaseModule {
  /** */
  public getIdToken(configuration?: GetIdTokenConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetIdTokenTestMode, [configuration]);
    return this.request<string>(requestPayload);
  }

  /** */
  public generateIdToken(configuration?: GenerateIdTokenConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GenerateIdTokenTestMode, [configuration]);
    return this.request<string>(requestPayload);
  }

  /** */
  public getMetadata() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetMetadataTestMode);
    return this.request<MagicUserMetadata>(requestPayload);
  }

  /** */
  public updateEmail(configuration: UpdateEmailConfiguration) {
    const { email, showUI = true } = configuration;
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.UpdateEmailTestMode, [{ email, showUI }]);
    return this.request<string | null, UpdateEmailEvents>(requestPayload);
  }

  /** */
  public isLoggedIn() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.IsLoggedInTestMode);
    return this.request<boolean>(requestPayload);
  }

  /** */
  public logout() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.LogoutTestMode);
    return this.request<boolean>(requestPayload);
  }
}
