import { BaseModule } from '../../modules/base-module';
import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../../core/json-rpc';
import { MagicSDKAdditionalConfiguration } from './sdk-types';
import { SDKBase } from '../../core/sdk';
import { AuthModule } from '../../modules/auth';
import { UserModule } from '../../modules/user';

type UnwrapArray<T extends any[]> = T extends Array<infer P> ? P : never;
type ExtensionNames<TExt extends Extension<string>[]> = UnwrapArray<
  {
    [P in keyof TExt]: TExt[P] extends Extension<infer K> ? K : never;
  }
>;

type GetExtensionFromName<TExt extends Extension<string>[], TExtName extends string> = {
  [P in TExtName]: Extract<UnwrapArray<TExt>, Extension<TExtName>>;
}[TExtName];

type ReservedExtensionKeys = 'name' | 'config' | 'sdk';

export type ExtensionUtils = {
  auth: AuthModule;
  user: UserModule;
  transport: BaseModule['transport'];
  overlay: BaseModule['overlay'];
  request: BaseModule['request'];
  createJsonRpcRequestPayload: typeof createJsonRpcRequestPayload;
  standardizeJsonRpcRequestPayload: typeof standardizeJsonRpcRequestPayload;
};

export abstract class Extension<TName extends string, TConfig extends any = {}> {
  public abstract readonly name: TName;
  public abstract readonly config: TConfig;
  protected readonly sdk!: ExtensionUtils;
}

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
        ? Omit<GetExtensionFromName<TExt, P>, ReservedExtensionKeys>
        : TExt extends { [P in TExtName]: Extension<string> }
        ? Omit<TExt[P], ReservedExtensionKeys>
        : never;
    };
};
