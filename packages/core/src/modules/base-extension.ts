import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../core/json-rpc';
import { BaseModule } from './base-module';
import { SDKBase } from '../core/sdk';
import { createExtensionNotInitializedError } from '../core/sdk-exceptions';

abstract class BaseExtension<TName extends string> extends BaseModule {
  public abstract readonly name: TName;

  private isInitialized = false;

  protected createJsonRpcRequestPayload = createJsonRpcRequestPayload;
  protected standardizeJsonRpcRequestPayload = standardizeJsonRpcRequestPayload;

  constructor() {
    super(undefined as any);

    // Dissallow SDK access before initialization.
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (['request', 'transport', 'overlay', 'sdk'].includes(prop as string) && !this.isInitialized) {
          throw createExtensionNotInitializedError(prop as string);
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  public init(sdk: SDKBase) {
    (this.sdk as any) = sdk;
    this.isInitialized = true;
  }
}

abstract class InternalExtension<TName extends string, TConfig extends any = any> extends BaseExtension<TName> {
  public abstract readonly config: TConfig;
}

export abstract class Extension<TName extends string> extends BaseExtension<TName> {
  /**
   * This is a special constructor used to mark an extension as "official." Only
   * official extensions can interact with the iframe using custom JSON RPC
   * methods and business logic. This is intended for internal-use only and
   * provides no advantage to open-source extension developers.
   *
   * @internal
   */
  public static Internal = InternalExtension;
}
