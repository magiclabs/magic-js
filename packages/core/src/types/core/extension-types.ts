import { SDKBase } from '../../core/sdk';
import { Extension } from '../../modules/base-extension';
import { UnwrapArray } from '../utility-types';
import { MagicSDKAdditionalConfiguration } from './sdk-types';

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
