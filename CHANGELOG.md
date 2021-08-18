# (Mon Aug 16 2021)

#### 🐛 Bug Fix

- `@magic-sdk/commons@1.2.1`, `@magic-sdk/provider@4.4.2`, `@magic-sdk/react-native@4.4.2`, `@magic-sdk/types@3.2.2`, `magic-sdk@4.4.2`
  - Migrate unit tests to Jest [#194](https://github.com/magiclabs/magic-js/pull/194) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Mon Aug 09 2021)

#### 🐛 Bug Fix

- `@magic-sdk/types@3.2.1`
  - register access control rpc error code [#193](https://github.com/magiclabs/magic-js/pull/193) ([@Dizigen](https://github.com/Dizigen))

#### Authors: 1

- David He ([@Dizigen](https://github.com/Dizigen))

---

# (Wed Jul 28 2021)

#### 🚀 Enhancement

- `@magic-sdk/commons@1.2.0`, `@magic-sdk/provider@4.4.0`, `@magic-sdk/react-native@4.4.0`, `@magic-sdk/types@3.2.0`, `magic-sdk@4.4.0`
  - Add explicit JSDelivr entry-point for `magic-sdk` [#191](https://github.com/magiclabs/magic-js/pull/191) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Fri Jun 11 2021)

#### 🐛 Bug Fix

- `@magic-sdk/react-native@4.3.1`
  - Upgrade @aveq-research/localforage-asyncstorage-driver [#183](https://github.com/magiclabs/magic-js/pull/183) ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# (Tue May 04 2021)

#### 🚀 Enhancement

- `@magic-sdk/provider@4.3.0`
  - Add test-mode prefix to Ethereum RPC methods [#181](https://github.com/magiclabs/magic-js/pull/181) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Fri Mar 19 2021)

#### 🐛 Bug Fix

- `@magic-sdk/types@3.1.1`
  - register "inactive recipient" rpc error code [#170](https://github.com/magiclabs/magic-js/pull/170) ([@Dizigen](https://github.com/Dizigen))

#### Authors: 1

- David He ([@Dizigen](https://github.com/Dizigen))

---

# (Mon Mar 15 2021)

#### 🚀 Enhancement

- `@magic-sdk/provider@4.2.0`, `@magic-sdk/types@3.1.0`
  - Add testing framework [#168](https://github.com/magiclabs/magic-js/pull/168) (harry [@smithki](https://github.com/smithki) [@harryEth](https://github.com/harryEth))

#### Authors: 3

- [@harryEth](https://github.com/harryEth)
- harry (harry)
- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Thu Jan 28 2021)

#### 🐛 Bug Fix

- `@magic-sdk/provider@4.1.1`
  - Support UTF-8 characters when encoding iframe options to Base64 [#160](https://github.com/magiclabs/magic-js/pull/160) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Sat Jan 23 2021)

#### 🚀 Enhancement

- `@magic-sdk/commons@1.1.0`, `magic-sdk@4.1.0`
  - Iframe accessibility improvements: Add `title` attribute and auto-focus when UI is showing [#158](https://github.com/magiclabs/magic-js/pull/158) ([@smithki](https://github.com/smithki))
- `@magic-sdk/provider@4.1.0`
  - Improve i18n Support [#157](https://github.com/magiclabs/magic-js/pull/157) ([@Dizigen](https://github.com/Dizigen) [@smithki](https://github.com/smithki))

#### 🔩 Dependency Updates

- [Snyk] Security upgrade snyk from 1.360.0 to 1.425.4 [#153](https://github.com/magiclabs/magic-js/pull/153) ([@snyk-bot](https://github.com/snyk-bot) [@smithki](https://github.com/smithki))

#### Authors: 3

- David He ([@Dizigen](https://github.com/Dizigen))
- Ian K Smith ([@smithki](https://github.com/smithki))
- Snyk bot ([@snyk-bot](https://github.com/snyk-bot))

---

# (Wed Dec 02 2020)

#### 🐛 Bug Fix

- `@magic-sdk/provider@4.0.2`
  - Remove ES6 Proxy references [#154](https://github.com/magiclabs/magic-js/pull/154) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Tue Dec 01 2020)

#### 🐛 Bug Fix

- `@magic-sdk/commons@1.0.1`, `@magic-sdk/provider@4.0.1`, `@magic-sdk/react-native@4.0.1`, `@magic-sdk/types@3.0.1`, `magic-sdk@4.0.1`
  - Add 'importHelpers: true' to base tsconfig.json [#152](https://github.com/magiclabs/magic-js/pull/152) ([@smithki](https://github.com/smithki))

#### 🏠 Internal

- Cleanup internal scripts [#150](https://github.com/magiclabs/magic-js/pull/150) ([@smithki](https://github.com/smithki))

#### 📝 Documentation

- `@magic-sdk/commons@1.0.1`, `@magic-sdk/provider@4.0.1`, `@magic-sdk/react-native@4.0.1`, `@magic-sdk/types@3.0.1`, `magic-sdk@4.0.1`
  - Fix incorrect TypeScript project references and update READMEs with changelog links [#151](https://github.com/magiclabs/magic-js/pull/151) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Tue Nov 17 2020)

#### 💥 Breaking Change

- `@magic-sdk/commons@1.0.0`, `@magic-sdk/provider@4.0.0`, `@magic-sdk/react-native@4.0.0`, `magic-sdk@4.0.0`
  - [All packages] Internal API changes & Cleanups [#149](https://github.com/magiclabs/magic-js/pull/149) ([@smithki](https://github.com/smithki))

#### 🐛 Bug Fix

- `@magic-sdk/provider@4.0.0`, `@magic-sdk/react-native@4.0.0`, `@magic-sdk/types@3.0.0`, `magic-sdk@4.0.0`
  - Update CHANGELOGs and CONTRIBUTING guide [#146](https://github.com/magiclabs/magic-js/pull/146) ([@smithki](https://github.com/smithki))

#### 🏠 Internal

- `@magic-sdk/provider@4.0.0`, `@magic-sdk/react-native@4.0.0`, `@magic-sdk/types@3.0.0`, `magic-sdk@4.0.0`
  - Simplify scripts [#147](https://github.com/magiclabs/magic-js/pull/147) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

