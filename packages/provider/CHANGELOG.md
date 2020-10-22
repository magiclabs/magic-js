# v3.0.1 (Thu Oct 22 2020)

#### 🐛 Bug Fix

- Add 'files' array back to package JSON [#120](https://github.com/magiclabs/magic-js/pull/120) ([@smithki](https://github.com/smithki))
- Release v3.0.0 [#145](https://github.com/magiclabs/magic-js/pull/145) ([@smithki](https://github.com/smithki) team@magic.link)
- Add framework for extension compatibility checks [#133](https://github.com/magiclabs/magic-js/pull/133) ([@smithki](https://github.com/smithki))
- [W.I.P.] Add `redirectURI` parameter to `loginWithMagicLink`; Implement `loginWithCredential` [#128](https://github.com/magiclabs/magic-js/pull/128) ([@smithki](https://github.com/smithki))
- Fix modal not poping up [#130](https://github.com/magiclabs/magic-js/pull/130) ([@Ethella](https://github.com/Ethella))
- add local flag to query param object [#127](https://github.com/magiclabs/magic-js/pull/127) ([@Dizigen](https://github.com/Dizigen))
- Add `-10005` error code to `RPCErrorCode` enum [#125](https://github.com/magiclabs/magic-js/pull/125) ([@smithki](https://github.com/smithki))
- Support expo 38 [#111](https://github.com/magiclabs/magic-js/pull/111) ([@Ethella](https://github.com/Ethella))
- Remove webauthn feature [#135](https://github.com/magiclabs/magic-js/pull/135) (harry [@harryEth](https://github.com/harryEth))
- Add explicit `targetOrigin` parameter to `postMessage` calls [#119](https://github.com/magiclabs/magic-js/pull/119) ([@smithki](https://github.com/smithki))
- Better development/build scripts [#118](https://github.com/magiclabs/magic-js/pull/118) ([@smithki](https://github.com/smithki))
- Add standard 'localforage' interface for Extensions [#116](https://github.com/magiclabs/magic-js/pull/116) ([@smithki](https://github.com/smithki))
- Webauthn support feature [#115](https://github.com/magiclabs/magic-js/pull/115) (harry [@harryEth](https://github.com/harryEth))
- Add Extension warnings and deprecation notices [#109](https://github.com/magiclabs/magic-js/pull/109) ([@smithki](https://github.com/smithki))
- Expose more utils on the 'Extension' base class [#108](https://github.com/magiclabs/magic-js/pull/108) ([@smithki](https://github.com/smithki))
- Framework for Magic SDK Extension errors [#107](https://github.com/magiclabs/magic-js/pull/107) ([@smithki](https://github.com/smithki))
- Refactor to a Lerna Monorepo [#101](https://github.com/magiclabs/magic-js/pull/101) ([@smithki](https://github.com/smithki))

#### ⚠️ Pushed to `master`

- Improve tconfig project references dependency graph ([@smithki](https://github.com/smithki))
- Update CHANGELOGs ([@smithki](https://github.com/smithki))
- Remove obsolete test ([@smithki](https://github.com/smithki))
- Add 'getting started' note to non-entry READMEs ([@smithki](https://github.com/smithki))
- Fix typo ([@smithki](https://github.com/smithki))
- Remove deprecated methods in preparation for v3 + cleanup READMEs ([@smithki](https://github.com/smithki))
- Publish ([@smithki](https://github.com/smithki))
- Publish ([@Ethella](https://github.com/Ethella))
- Publish ([@Dizigen](https://github.com/Dizigen))
- Add missing bullet point ([@smithki](https://github.com/smithki))
- Update React-native CHANGELOG.md ([@Ethella](https://github.com/Ethella))
- Export 'PromiEvent' and 'isPromiEvent' from SDK entry-points ([@smithki](https://github.com/smithki))
- Use better semantics in SDKEnvironment ([@smithki](https://github.com/smithki))
- Remove 'files' arrays from pkg json ([@smithki](https://github.com/smithki))
- Update 'files' array in pkg json ([@smithki](https://github.com/smithki))
- Remove type import ([@smithki](https://github.com/smithki))
- Fix type import reference in 'sdk-environment.ts' ([@smithki](https://github.com/smithki))
- Add githead to package.json (lerna generated) ([@smithki](https://github.com/smithki))
- Add test coverage for new BaseExtension features ([@smithki](https://github.com/smithki))
- Update MagicRPCError type to accept plain numbers as error code ([@smithki](https://github.com/smithki))
- Update CHANGELOG ([@smithki](https://github.com/smithki))
- Cast default PromiEvent 'error' argument type to 'any' ([@smithki](https://github.com/smithki))
- Update ESLint & Prettier to support modern TypeScript features ([@smithki](https://github.com/smithki))
- Update CHANGELOG.md ([@Ethella](https://github.com/Ethella))

#### Authors: 6

- [@harryEth](https://github.com/harryEth)
- David He ([@Dizigen](https://github.com/Dizigen))
- harry (harry)
- Ian K Smith ([@smithki](https://github.com/smithki))
- Jerry Liu ([@Ethella](https://github.com/Ethella))
- Magic Labs (team@magic.link)

---

## Upcoming Changes

#### Fixed

- ...

#### Changed

- ...

#### Added

- ...

## `3.0.0` - 10/20/2020

#### Changed

- Removed the following public methods and functions
    - `BaseExtension.utils.encodeQueryParameters`
    - `BaseExtension.utils.decodeQueryParameters`

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
