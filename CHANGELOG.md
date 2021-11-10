# (Wed Nov 10 2021)

#### 🐛 Bug Fix

- `@magic-ext/oauth@0.11.2`
  - move crypto-js to devDependencies to fix bundling error [#242](https://github.com/magiclabs/magic-js/pull/242) ([@hcote](https://github.com/hcote))

#### Authors: 1

- Hunter Cote ([@hcote](https://github.com/hcote))

---

# (Mon Nov 08 2021)

#### 🚀 Enhancement

- `@magic-sdk/pnp@0.6.0`
  - Add parameters for ToS and privacy links to `@magic-sdk/pnp` [#240](https://github.com/magiclabs/magic-js/pull/240) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Mon Nov 08 2021)

#### 🐛 Bug Fix

- `@magic-sdk/provider@6.2.1`
  - Remove 'semver' re-export from '@magic-sdk/provider' utils [#237](https://github.com/magiclabs/magic-js/pull/237) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Fri Oct 29 2021)

#### 🚀 Enhancement

- `@magic-sdk/pnp@0.5.0`
  - Add support for `data-locale` parameter in `@magic-sdk/pnp` [#234](https://github.com/magiclabs/magic-js/pull/234) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Wed Oct 27 2021)

#### 💥 Breaking Change

- `@magic-ext/bitcoin@1.0.0`
  - add bitcoin extension for web and react native [#233](https://github.com/magiclabs/magic-js/pull/233) ([@hcote](https://github.com/hcote))

#### Authors: 1

- Hunter Cote ([@hcote](https://github.com/hcote))

---

# (Fri Oct 22 2021)

#### 🚀 Enhancement

- `@magic-sdk/pnp@0.4.0`, `@magic-sdk/provider@6.2.0`, `@magic-sdk/types@5.2.0`
  - Add `UserModule#settings` endpoint [#231](https://github.com/magiclabs/magic-js/pull/231) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Thu Oct 21 2021)

#### 🐛 Bug Fix

- `@magic-ext/oauth@0.10.4`, `@magic-ext/react-native-oauth@0.5.4`, `@magic-ext/webauthn@0.2.4`, `@magic-sdk/commons@2.1.4`, `@magic-sdk/provider@6.1.4`, `@magic-sdk/react-native@6.1.4`, `@magic-sdk/types@5.1.4`, `magic-sdk@6.1.4`
  - Revert to `.js` extension for ES module builds targeting webpack/CRA [#232](https://github.com/magiclabs/magic-js/pull/232) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Wed Oct 20 2021)

#### ⚠️ Pushed to `master`

- Update yarn.lock ([@smithki](https://github.com/smithki))
- `@magic-sdk/commons@2.1.3`, `@magic-sdk/provider@6.1.3`, `@magic-sdk/react-native@6.1.3`, `@magic-sdk/types@5.1.3`, `magic-sdk@6.1.3`
  - Fix dist files glob in package.json ([@smithki](https://github.com/smithki))
- `@magic-ext/oauth@0.10.3`, `@magic-ext/react-native-oauth@0.5.3`, `@magic-ext/webauthn@0.2.3`, `@magic-sdk/commons@2.1.3`, `@magic-sdk/pnp@0.3.2`, `@magic-sdk/provider@6.1.3`, `@magic-sdk/react-native@6.1.3`, `@magic-sdk/types@5.1.3`, `magic-sdk@6.1.3`
  - Merge branch 'master' of github.com:magiclabs/magic-js ([@smithki](https://github.com/smithki))
  - Force re-publish ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Wed Oct 20 2021)

#### 🐛 Bug Fix

- `@magic-ext/oauth@0.10.2`, `@magic-ext/react-native-oauth@0.5.2`, `@magic-ext/webauthn@0.2.2`, `@magic-sdk/commons@2.1.2`, `@magic-sdk/provider@6.1.2`, `@magic-sdk/react-native@6.1.2`, `@magic-sdk/types@5.1.2`, `magic-sdk@6.1.2`
  - Use '.mjs' extension for ESM build files [#230](https://github.com/magiclabs/magic-js/pull/230) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Wed Oct 20 2021)

#### 🚀 Enhancement

- `@magic-sdk/pnp@0.3.0`
  - [HOLD MERGE] Enable opinionated "Plug & Play" implementation approach for web [#221](https://github.com/magiclabs/magic-js/pull/221) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Tue Oct 19 2021)

#### 🐛 Bug Fix

- `@magic-sdk/provider@6.1.1`
  - Fix bug with `d.generateKey is undefined` build bug [#228](https://github.com/magiclabs/magic-js/pull/228) ([@dgerrellsMagic](https://github.com/dgerrellsMagic))
- `@magic-sdk/types@5.1.1`
  - add typing for metadata phone number [#225](https://github.com/magiclabs/magic-js/pull/225) ([@dgerrellsMagic](https://github.com/dgerrellsMagic))

#### Authors: 1

- [@dgerrellsMagic](https://github.com/dgerrellsMagic)

---

# (Fri Oct 01 2021)

#### 🚀 Enhancement

- `@magic-sdk/provider@6.1.0`, `@magic-sdk/types@5.1.0`
  - Enable SMS login [#223](https://github.com/magiclabs/magic-js/pull/223) ([@dgerrellsMagic](https://github.com/dgerrellsMagic))

#### Authors: 1

- [@dgerrellsMagic](https://github.com/dgerrellsMagic)

---

# (Thu Sep 23 2021)

#### 🐛 Bug Fix

- `magic-sdk@6.0.7`
  - Change 'externals' and 'global' condition in magic-sdk > CDN build [#219](https://github.com/magiclabs/magic-js/pull/219) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Thu Sep 23 2021)

#### 🐛 Bug Fix

- `@magic-ext/oauth@0.9.1`, `@magic-ext/react-native-oauth@0.4.1`, `@magic-ext/webauthn@0.1.1`, `@magic-sdk/commons@2.0.6`, `@magic-sdk/provider@6.0.6`, `@magic-sdk/react-native@6.0.6`, `@magic-sdk/types@5.0.3`, `magic-sdk@6.0.6`
  - Port `@magic-ext/oauth`, `@magic-ext/react-native-oauth`, `@magic-ext/webauthn` extensions to Magic SDK monorepo [#218](https://github.com/magiclabs/magic-js/pull/218) ([@smithki](https://github.com/smithki))
- `@magic-sdk/commons@2.0.6`, `@magic-sdk/provider@6.0.6`, `@magic-sdk/react-native@6.0.6`, `@magic-sdk/types@5.0.3`, `magic-sdk@6.0.6`
  - Add `@magic-sdk/pnp` package for out-of-the-box login page UIs [#217](https://github.com/magiclabs/magic-js/pull/217) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Fri Sep 17 2021)

#### 🐛 Bug Fix

- `@magic-sdk/provider@6.0.5`, `magic-sdk@6.0.5`
  - Fix `regeneratorRuntime` is not defined in `@magic-sdk/provider` [#215](https://github.com/magiclabs/magic-js/pull/215) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Fri Sep 17 2021)

#### 🐛 Bug Fix

- `@magic-sdk/commons@2.0.4`, `@magic-sdk/provider@6.0.4`, `@magic-sdk/types@5.0.2`, `magic-sdk@6.0.4`
  - Fix CJS-dependent entry-points using the 'exports' field in package.json [#214](https://github.com/magiclabs/magic-js/pull/214) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Thu Sep 16 2021)

#### 🐛 Bug Fix

- `@magic-sdk/provider@6.0.3`, `magic-sdk@6.0.3`
  - Enable `skipLibCheck: false` to work with Magic SDK + TypeScript projects [#212](https://github.com/magiclabs/magic-js/pull/212) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Tue Sep 14 2021)

#### 🐛 Bug Fix

- `@magic-sdk/commons@2.0.2`, `@magic-sdk/provider@6.0.2`, `@magic-sdk/react-native@6.0.2`, `@magic-sdk/types@5.0.1`, `magic-sdk@6.0.2`
  - Import regeneratorRuntime in Magic JS (non-CDN version) [#210](https://github.com/magiclabs/magic-js/pull/210) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Tue Sep 14 2021)

#### 🐛 Bug Fix

- `@magic-sdk/provider@6.0.1`, `@magic-sdk/react-native@6.0.1`, `magic-sdk@6.0.1`
  - Fix SemVer cyclic dependency issues with some hacks [#209](https://github.com/magiclabs/magic-js/pull/209) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Tue Sep 14 2021)

#### 💥 Breaking Change

- `@magic-sdk/commons@2.0.0`, `@magic-sdk/provider@6.0.0`, `@magic-sdk/react-native@6.0.0`, `@magic-sdk/types@5.0.0`, `magic-sdk@6.0.0`
  - v6.0.0 [#208](https://github.com/magiclabs/magic-js/pull/208) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Thu Sep 02 2021)

#### 🚀 Enhancement

- `@magic-sdk/provider@5.1.0`
  - [Feat]: Update type signature of `RpcProviderModule` to implement Web3's `AbstractProvider` [#201](https://github.com/magiclabs/magic-js/pull/201) ([@adenekan41](https://github.com/adenekan41) [@smithki](https://github.com/smithki))
  - bypass webcrypto on non web platforms [#200](https://github.com/magiclabs/magic-js/pull/200) ([@dgerrellsMagic](https://github.com/dgerrellsMagic))

#### Authors: 3

- [@dgerrellsMagic](https://github.com/dgerrellsMagic)
- Adenekan Wonderful ([@adenekan41](https://github.com/adenekan41))
- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Tue Aug 31 2021)

#### 💥 Breaking Change

- `@magic-sdk/provider@5.0.0`, `@magic-sdk/types@4.0.0`
  - Custom session duration [#199](https://github.com/magiclabs/magic-js/pull/199) ([@dgerrellsMagic](https://github.com/dgerrellsMagic))

#### 🔩 Dependency Updates

- Update `auto` [#195](https://github.com/magiclabs/magic-js/pull/195) ([@smithki](https://github.com/smithki))

#### Authors: 2

- [@dgerrellsMagic](https://github.com/dgerrellsMagic)
- Ian K Smith ([@smithki](https://github.com/smithki))

---

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

