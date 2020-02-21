import { ComposeTransactionConfig, FmPayloadMethod } from '../../types';
import { createJsonRpcRequestPayload } from '../../util/json-rpc-helpers';
import { BaseModule } from '../base-module';

/**
 *
 */
export class TransactionsModule extends BaseModule {
  /** */
  send(config: ComposeTransactionConfig, cb: any) {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_composeSend, config);
    this.sdk.getProvider().sendFortmaticAsync(fmRequestPayload, cb);
  }
}
