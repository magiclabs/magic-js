import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../core/json-rpc';
import { BaseModule } from './base-module';
import { SDKBase, MagicSDKAdditionalConfiguration } from '../core/sdk';
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

type UnwrapArray<T extends any[]> = T extends Array<infer P> ? P : never;

type ExtensionNames<TExt extends Extension<string>[]> = UnwrapArray<
  {
    [P in keyof TExt]: TExt[P] extends Extension<infer K> ? K : never;
  }
>;

type GetExtensionFromName<TExt extends Extension<string>[], TExtName extends string> = {
  [P in TExtName]: Extract<UnwrapArray<TExt>, Extension<TExtName>>;
}[TExtName];

/**
 * Wraps a Magic SDK constructor with the necessary type information to support
 * a strongly-typed `Extension` interface.
 */
export type WithExtensions<SDK extends SDKBase> = {
  new <
    TCustomExtName extends string,
    TExt extends Extension<string>[] | { [P in TCustomExtName]: Extension<string> },
    TExtName extends string = TExt extends Extension<string>[] ? ExtensionNames<TExt> : keyof TExt
  >(
    apiKey: string,
    options?: MagicSDKAdditionalConfiguration<TCustomExtName, TExt>,
  ): SDK &
    {
      [P in TExtName]: TExt extends Extension<string>[]
        ? Omit<GetExtensionFromName<TExt, P>, 'name' | 'config' | 'init'>
        : TExt extends { [P in TExtName]: Extension<string> }
        ? Omit<TExt[P], 'name' | 'config' | 'init'>
        : never;
    };
};
