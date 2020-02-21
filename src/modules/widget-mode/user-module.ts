import { FmPayloadMethod } from '../../types';
import { emitFortmaticPayload } from '../../util/emit-payload-promise';
import { createJsonRpcRequestPayload } from '../../util/json-rpc-helpers';
import { BaseModule } from '../base-module';

/**
 *
 */
export class UserModule extends BaseModule {
  /** */
  public async login() {
    await this.sdk.getProvider().enable();
  }

  /** */
  public logout() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_logout);
    return emitFortmaticPayload<void>(this.sdk.getProvider(), fmRequestPayload);
  }

  /** */
  public getUser() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_get_user);
    return emitFortmaticPayload(this.sdk.getProvider(), fmRequestPayload);
  }

  /** */
  public getBalances() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_get_balances);
    return emitFortmaticPayload(this.sdk.getProvider(), fmRequestPayload);
  }

  /** */
  public getTransactions() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_get_transactions);
    return emitFortmaticPayload(this.sdk.getProvider(), fmRequestPayload);
  }

  /** */
  public isLoggedIn() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_is_logged_in);
    return emitFortmaticPayload(this.sdk.getProvider(), fmRequestPayload);
  }

  /** */
  public settings() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_accountSettings);
    return emitFortmaticPayload(this.sdk.getProvider(), fmRequestPayload);
  }

  /** */
  public deposit() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_deposit);
    return emitFortmaticPayload(this.sdk.getProvider(), fmRequestPayload);
  }
}
