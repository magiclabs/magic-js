# v3.0.1 (Thu Oct 22 2020)

#### 🐛 Bug Fix

- Add explicit `targetOrigin` parameter to `postMessage` calls [#119](https://github.com/magiclabs/magic-js/pull/119) ([@smithki](https://github.com/smithki))
- Release v3.0.0 [#145](https://github.com/magiclabs/magic-js/pull/145) ([@smithki](https://github.com/smithki) team@magic.link)
- [W.I.P.] Add `redirectURI` parameter to `loginWithMagicLink`; Implement `loginWithCredential` [#128](https://github.com/magiclabs/magic-js/pull/128) ([@smithki](https://github.com/smithki))
- Fix modal not poping up [#130](https://github.com/magiclabs/magic-js/pull/130) ([@Ethella](https://github.com/Ethella))
- add local flag to query param object [#127](https://github.com/magiclabs/magic-js/pull/127) ([@Dizigen](https://github.com/Dizigen))
- Add `-10005` error code to `RPCErrorCode` enum [#125](https://github.com/magiclabs/magic-js/pull/125) ([@smithki](https://github.com/smithki))
- Support expo 38 [#111](https://github.com/magiclabs/magic-js/pull/111) ([@Ethella](https://github.com/Ethella))
- Add 'files' array back to package JSON [#120](https://github.com/magiclabs/magic-js/pull/120) ([@smithki](https://github.com/smithki))
- Jerryliu ch25267 missing dependency bigint in react native [#132](https://github.com/magiclabs/magic-js/pull/132) ([@Ethella](https://github.com/Ethella))
- Better development/build scripts [#118](https://github.com/magiclabs/magic-js/pull/118) ([@smithki](https://github.com/smithki))
- Add standard 'localforage' interface for Extensions [#116](https://github.com/magiclabs/magic-js/pull/116) ([@smithki](https://github.com/smithki))
- Webauthn support feature [#115](https://github.com/magiclabs/magic-js/pull/115) (harry [@harryEth](https://github.com/harryEth))
- Add Extension warnings and deprecation notices [#109](https://github.com/magiclabs/magic-js/pull/109) ([@smithki](https://github.com/smithki))
- Framework for Magic SDK Extension errors [#107](https://github.com/magiclabs/magic-js/pull/107) ([@smithki](https://github.com/smithki))
- Remove react-native-webview dependencies [#106](https://github.com/magiclabs/magic-js/pull/106) (ethellagit@gmail.com [@Ethella](https://github.com/Ethella))
- Remove react-native-webview dependencies (ethellagit@gmail.com)
- Refactor to a Lerna Monorepo [#101](https://github.com/magiclabs/magic-js/pull/101) ([@smithki](https://github.com/smithki))

#### ⚠️ Pushed to `master`

- Adjust 'env.ts' script interpolation strategy ([@smithki](https://github.com/smithki))
- Update CHANGELOGs ([@smithki](https://github.com/smithki))
- Remove deprecated methods in preparation for v3 + cleanup READMEs ([@smithki](https://github.com/smithki))
- Publish ([@smithki](https://github.com/smithki))
- Publish ([@Ethella](https://github.com/Ethella))
- Publish ([@Dizigen](https://github.com/Dizigen))
- Fix '@magic-sdk/react-native' CHANGELOG disparity ([@smithki](https://github.com/smithki))
- Export 'PromiEvent' and 'isPromiEvent' from SDK entry-points ([@smithki](https://github.com/smithki))
- Improve tconfig project references dependency graph ([@smithki](https://github.com/smithki))
- Use better semantics in SDKEnvironment ([@smithki](https://github.com/smithki))
- New strategy for injecting ENV variables ([@smithki](https://github.com/smithki))
- Fix npm pack issue on emergency basis ([@smithki](https://github.com/smithki))
- Remove 'files' arrays from pkg json ([@smithki](https://github.com/smithki))
- Update 'files' array in pkg json ([@smithki](https://github.com/smithki))
- Add githead to package.json (lerna generated) ([@smithki](https://github.com/smithki))
- Update ESLint & Prettier to support modern TypeScript features ([@smithki](https://github.com/smithki))
- Update CHANGELOG.md ([@Ethella](https://github.com/Ethella))
- Merge remote-tracking branch 'origin/master' ([@Ethella](https://github.com/Ethella))

#### Authors: 7

- [@harryEth](https://github.com/harryEth)
- David He ([@Dizigen](https://github.com/Dizigen))
- Ethella (ethellagit@gmail.com)
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

## `2.7.1` - 09/18/2020

#### Fixed

- Fix missing BigInt dependency #131

## `2.7.0` - 09/15/2020

#### Added

- New, optional `redirectURI` parameter for the `loginWithMagicLink` method
- New `loginWithCredential` method for completing a magic link login with redirect: `await magic.auth.loginWithCredential()`

## `2.6.0` - 08/24/2020

#### Added

- New optional `locale` parameter to SDK constructor

## `2.5.1` - 08/20/2020

#### Added

- New RPC error code for the `loginWithMagicLink` method: `-10005`

## `2.4.6` - 07/22/2020

#### Added

- Export `PromiEvent` type and `isPromiEvent` utility from SDK entry-points (`magic-sdk` and `@magic-sdk/react-native`).

## `2.4.1` through `2.4.5` - 07/13/2020

#### Fixed

- Bug preventing NPM tarball from containing `/dist` files.

## `2.4.0` - 07/13/2020

#### Changed

- Updated build system to use TypeScript project references instead of Microbundle.
- Pass `targetOrigin` parameter to `postMessage` calls.

## `2.3.1` - 07/08/2020

#### Fixed

- Bug affecting `localforage` type imports causing compilation failure in TypeScript.

## `2.3.0` - 07/08/2020

#### Added

- WebAuthn support.
- `localforage` APIs for Magic SDK Extensions.

## `2.1.0` - 06/25/2020

#### Changed

- Update dependencies.

#### Added

- Add `ExtensionWarning` class.

## `2.0.5` - 06/23/2020

#### Changed

- Update dependencies.

## `2.0.4` - 06/23/2020

#### Changed

- Update dependencies.

## `2.0.3` - 06/23/2020

#### Changed

- Update dependencies.

## `2.0.2` - 06/22/2020

#### Changed

- Update dependencies.

## `2.0.1` - 06/16/2020

#### Added

- Introduce the `ExtensionError` type to ease handling of errors rising from Magic SDK Extensions.

## `2.0.0` - 06/12/2020

#### Changed

- Move "react-native-webivew" to peer dependencies

## `1.0.1` - 06/11/2020

#### Changed

- Update dependencies.
- Circle CI tag in readme is broken after namechange from MagicHQ to MagicLabs

## `1.0.0` - 06/02/2020

This is the first release our changelog records. Future updates will be logged in the following format:

#### Fixed

- Bug fixes and patches will be described here.

#### Changed

- Changes (breaking or otherwise) to current APIs will be described here.

#### Added

- New features or APIs will be described here.
