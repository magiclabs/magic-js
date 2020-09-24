## Upcoming Changes

#### Fixed

- ...

#### Changed

- ...

#### Added

- ...

## `2.8.0` - 09/24/2020

#### Added

- Adds a Magic SDK extensions runtime compatibility check, ensuring you're version of Magic SDK is designed for the extensions you have in use.

## `2.7.0` - 09/15/2020

#### Added

- New, optional `redirectURI` parameter for the `loginWithMagicLink` method
- New `loginWithCredential` method for completing a magic link login with redirect: `await magic.auth.loginWithCredential()`

## `2.6.1` - 09/03/2020

- Fix Modal doesn't show up

## `2.6.0` - 08/24/2020

#### Added

- New optional `locale` parameter to SDK constructor

## `2.5.7` - 08/20/2020

#### Added

- New RPC error code for the `loginWithMagicLink` method: `-10005`

## `2.5.6` - 08/04/2020

- Add `process` and `buffer` to the dependencies

## `2.5.5` - 07/22/2020

#### Added

- Export `PromiEvent` type and `isPromiEvent` utility from SDK entry-points (`magic-sdk` and `@magic-sdk/react-native`).

## `2.5.1` through `2.5.4` - 07/13/2020

#### Fixed

- Bug preventing NPM tarball from containing `/dist` files.

## `2.5.0` - 07/13/2020

#### Changed

- Updated build system to use TypeScript project references instead of Microbundle.
- Pass `targetOrigin` parameter to `postMessage` calls.

## `2.4.1` - 07/08/2020

#### Fixed

- Bug affecting `localforage` type imports causing compilation failure in TypeScript.

## `2.4.0` - 07/08/2020

#### Added

- WebAuthn support.
- `localforage` APIs for Magic SDK Extensions.

## `2.2.0` - 06/25/2020

#### Changed

- Update dependencies.
- Marked `encodeQueryParameters` and `decodeQueryParameters` utility methods for deprecation in `v3.0.0`.

#### Added

- Add `MagicExtensionWarning` class.
- Add `createWarning` and `createDeprecationWarning` helper methods to `BaseExtension`.
- Add `encodeJSON` and `decodeJSON` helper methods to `BaseExtension.utils`. These are direct aliases for `encodeQueryParameters` and `decodeQueryParameters` (which will be deprecated in the next major version).

## `2.1.2` - 06/23/2020

#### Changed

- `MagicRPCError.code` can now be typed as a plain `number` for greater flexibility.

## `2.1.1` - 06/23/2020

#### Changed

- The argument type given to the default `"error"` event of `PromiEvent` is now `any` (in line with native Promise typings).

## `2.1.0` - 06/23/2020

#### Added

- Add the `BaseExtension.createError` method.
- You are now able to attach arbitrary, strongly-typed data to `MagicExtensionError` objects.

## `2.0.0` - 06/22/2020

#### Added

- The following utilities are now exposed on the `Extension` base class: `createPromiEvent`, `decodeQueryParameters`, `encodeQueryParameters`.

#### Changed

- The `createJsonRpcRequestPayload` and `standardizeJsonRpcRequestPayload` utilities are now nested under the `utils` field of the `Extension` base class.

## `1.0.3` - 06/16/2020

#### Added

- Introduced `MagicExtensionError` type to create consistency for errors rising from Magic SDK Extensions.
- Add the `BaseExtension.raiseError` method.

## `1.0.2` - 06/12/2020

#### Changed

- Update dependencies.
- Circle CI tag in readme is broken after namechange from MagicHQ to MagicLabs

## `1.0.1` - 06/11/2020

#### Changed

- Update dependencies.

## `1.0.0` - 06/02/2020

This is the first release our changelog records. Future updates will be logged in the following format:

#### Fixed

- Bug fixes and patches will be described here.

#### Changed

- Changes (breaking or otherwise) to current APIs will be described here.

#### Added

- New features or APIs will be described here.
