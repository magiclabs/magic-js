# v2.0.1 (Thu Oct 22 2020)

#### 🐛 Bug Fix

- Add 'files' array back to package JSON [#120](https://github.com/magiclabs/magic-js/pull/120) ([@smithki](https://github.com/smithki))
- Release v3.0.0 [#145](https://github.com/magiclabs/magic-js/pull/145) ([@smithki](https://github.com/smithki) team@magic.link)
- Add framework for extension compatibility checks [#133](https://github.com/magiclabs/magic-js/pull/133) ([@smithki](https://github.com/smithki))
- [W.I.P.] Add `redirectURI` parameter to `loginWithMagicLink`; Implement `loginWithCredential` [#128](https://github.com/magiclabs/magic-js/pull/128) ([@smithki](https://github.com/smithki))
- add local flag to query param object [#127](https://github.com/magiclabs/magic-js/pull/127) ([@Dizigen](https://github.com/Dizigen))
- Add `-10005` error code to `RPCErrorCode` enum [#125](https://github.com/magiclabs/magic-js/pull/125) ([@smithki](https://github.com/smithki))
- Remove webauthn feature [#135](https://github.com/magiclabs/magic-js/pull/135) (harry [@harryEth](https://github.com/harryEth))
- Add explicit `targetOrigin` parameter to `postMessage` calls [#119](https://github.com/magiclabs/magic-js/pull/119) ([@smithki](https://github.com/smithki))
- Better development/build scripts [#118](https://github.com/magiclabs/magic-js/pull/118) ([@smithki](https://github.com/smithki))
- Webauthn support feature [#115](https://github.com/magiclabs/magic-js/pull/115) (harry [@harryEth](https://github.com/harryEth))
- Webauthn support types [#114](https://github.com/magiclabs/magic-js/pull/114) (harry [@harryEth](https://github.com/harryEth))
- Add Extension warnings and deprecation notices [#109](https://github.com/magiclabs/magic-js/pull/109) ([@smithki](https://github.com/smithki))
- Refactor to a Lerna Monorepo [#101](https://github.com/magiclabs/magic-js/pull/101) ([@smithki](https://github.com/smithki))

#### ⚠️ Pushed to `master`

- updated changelog for types ([@Dizigen](https://github.com/Dizigen))
- Update CHANGELOGs ([@smithki](https://github.com/smithki))
- Remove deprecated methods in preparation for v3 + cleanup READMEs ([@smithki](https://github.com/smithki))
- Publish ([@smithki](https://github.com/smithki))
- Add new error code to indicate invalid magic link redirect URL values ([@smithki](https://github.com/smithki))
- Publish ([@Ethella](https://github.com/Ethella))
- Add 'getting started' note to non-entry READMEs ([@smithki](https://github.com/smithki))
- Publish ([@Dizigen](https://github.com/Dizigen))
- Remove 'files' arrays from pkg json ([@smithki](https://github.com/smithki))
- Update 'files' array in pkg json ([@smithki](https://github.com/smithki))
- Add githead to package.json (lerna generated) ([@smithki](https://github.com/smithki))
- Update CHANGELOG.md ([@Ethella](https://github.com/Ethella))
- Update '@magic-sdk/types' description in package.json ([@smithki](https://github.com/smithki))

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

## `1.6.0` - 09/24/2020

#### Added

- Adds a Magic SDK extensions runtime compatibility check, ensuring you're version of Magic SDK is designed for the extensions you have in use.

## `1.5.0` - 09/15/2020

#### Added

- New, optional `redirectURI` parameter for the `loginWithMagicLink` method
- New `loginWithCredential` method for completing a magic link login with redirect: `await magic.auth.loginWithCredential()`

## `1.4.8` - 08/20/2020

#### Added

- Updated dependencies

## `1.4.7` - 08/20/2020

#### Added

- Updated dependencies

## `1.4.6` - 08/20/2020

#### Added

- New RPC error code for the `loginWithMagicLink` method: `-10005`

## `1.4.5` - 07/22/2020

#### Added

- Export `PromiEvent` type and `isPromiEvent` utility from SDK entry-points (`magic-sdk` and `@magic-sdk/react-native`).

## `1.4.1` through `1.4.4` - 07/13/2020

#### Fixed

- Bug preventing NPM tarball from containing `/dist` files.

## `1.4.0` - 07/13/2020

#### Changed

- Updated build system to use TypeScript project references instead of Microbundle.
- Pass `targetOrigin` parameter to `postMessage` calls.

## `1.3.1` - 07/08/2020

#### Fixed

- Bug affecting `localforage` type imports causing compilation failure in TypeScript.

## `1.3.0` - 07/08/2020

#### Added

- WebAuthn support.

## `1.1.0` - 06/23/2020

#### Added

- Add `SDKWarningCode.DeprecationNotice`.

## `1.0.3` - 06/23/2020

#### Changed

- Update dependencies.

## `1.0.2` - 06/12/2020

#### Changed

- Update dependencies.
- Circle CI tag in readme is broken after namechange from MagicHQ to MagicLabs

## `1.0.1` - 06/11/2020

#### Changed

- Update `package.json` description.

## `1.0.0` - 06/02/2020

This is the first release our changelog records. Future updates will be logged in the following format:

#### Fixed

- Bug fixes and patches will be described here.

#### Changed

- Changes (breaking or otherwise) to current APIs will be described here.

#### Added

- New features or APIs will be described here.
