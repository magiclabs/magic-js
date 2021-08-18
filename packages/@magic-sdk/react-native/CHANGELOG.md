# v4.4.2 (Mon Aug 16 2021)

#### 🐛 Bug Fix

- Migrate unit tests to Jest [#194](https://github.com/magiclabs/magic-js/pull/194) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# v4.4.0 (Wed Jul 28 2021)

#### 🚀 Enhancement

- Add explicit JSDelivr entry-point for `magic-sdk` [#191](https://github.com/magiclabs/magic-js/pull/191) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# v4.3.1 (Fri Jun 11 2021)

#### 🐛 Bug Fix

- Upgrade @aveq-research/localforage-asyncstorage-driver [#183](https://github.com/magiclabs/magic-js/pull/183) ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# v4.0.1 (Tue Dec 01 2020)

#### 🐛 Bug Fix

- Add 'importHelpers: true' to base tsconfig.json [#152](https://github.com/magiclabs/magic-js/pull/152) ([@smithki](https://github.com/smithki))

#### 📝 Documentation

- Fix incorrect TypeScript project references and update READMEs with changelog links [#151](https://github.com/magiclabs/magic-js/pull/151) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# v4.0.0 (Tue Nov 17 2020)

#### 💥 Breaking Change

- [All packages] Internal API changes & Cleanups [#149](https://github.com/magiclabs/magic-js/pull/149) ([@smithki](https://github.com/smithki))

#### 🐛 Bug Fix

- Update CHANGELOGs and CONTRIBUTING guide [#146](https://github.com/magiclabs/magic-js/pull/146) ([@smithki](https://github.com/smithki))

#### 🏠 Internal

- Simplify scripts [#147](https://github.com/magiclabs/magic-js/pull/147) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

## `3.0.1` - 10/21/2020

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
