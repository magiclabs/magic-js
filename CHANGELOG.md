# (Tue Dec 20 2022)

#### 💥 Breaking Change

- `@magic-ext/solana@7.0.0`
  - Deprecate sendAndConfirmTransaction for @magic-ext/solana [#402](https://github.com/magiclabs/magic-js/pull/402) (justin@magic.link)

#### 🚀 Enhancement

- `@magic-sdk/provider@11.0.0`
  - Updating SDK version [#393](https://github.com/magiclabs/magic-js/pull/393) ([@mushfichowdhury-magic](https://github.com/mushfichowdhury-magic))
- `@magic-ext/connect@4.0.0`
  - add getWalletInfo method [#352](https://github.com/magiclabs/magic-js/pull/352) ([@hcote](https://github.com/hcote))

#### 🐛 Bug Fix

- `@magic-sdk/provider@11.0.0`, `@magic-sdk/types@10.0.0`
  - Mushfichowdhury sc 61149 implement event emitting in magic sdk [#390](https://github.com/magiclabs/magic-js/pull/390) ([@mushfichowdhury-magic](https://github.com/mushfichowdhury-magic))
- `@magic-ext/react-native-oauth@5.0.0`, `@magic-sdk/react-native@12.0.0`
  - Adds more Context about Expo dependency in `@magic-ext/react-native-oauth` to README [#386](https://github.com/magiclabs/magic-js/pull/386) ([@Ariflo](https://github.com/Ariflo))

#### ⚠️ Pushed to `master`

- `@magic-ext/react-native-oauth@5.0.0`
  - Add bundleId to the OAuth query ([@Ethella](https://github.com/Ethella))

#### 📝 Documentation

- `@magic-sdk/react-native@12.0.0`
  - Adds advice for fixing symlink error in RN projects inside of Monorepos to README [#395](https://github.com/magiclabs/magic-js/pull/395) ([@Ariflo](https://github.com/Ariflo))

#### 🔩 Dependency Updates

- Bump minimatch from 3.0.4 to 3.1.2 [#387](https://github.com/magiclabs/magic-js/pull/387) ([@dependabot[bot]](https://github.com/dependabot[bot]) [@Ethella](https://github.com/Ethella))

#### Authors: 6

- [@dependabot[bot]](https://github.com/dependabot[bot])
- Arian Flores ([@Ariflo](https://github.com/Ariflo))
- Hunter Cote ([@hcote](https://github.com/hcote))
- Jerry Liu ([@Ethella](https://github.com/Ethella))
- Justin Herrera ([@justinnout](https://github.com/justinnout))
- Mushfi Chowdhury ([@mushfichowdhury-magic](https://github.com/mushfichowdhury-magic))

---

# (Tuesday Nov 22 2022)

#### ➕ Version Bump

- `@magic-sdk@10.1.0`
	- Added Bidirectional RPC Event Support

#### Authors: 1

- Mushfi Chowdhury ([@mushfichowdhury-magic](https://github.com/mushfichowdhury-magic))

---

# (Tues Nov 15 2022)

#### ➕ Version Bump

- `@magic-sdk@10.0.0`
	- Version bump, no major updates

#### Authors: 1

- Arian Flores ([@Ariflo](https://github.com/ariflo))

---

# (Wed Sep 28 2022)

#### 💥 Breaking Change

- `@magic-sdk/types@9.0.0`
  - drop legacy testnet support [#364](https://github.com/magiclabs/magic-js/pull/364) ([@harryEth](https://github.com/harryEth))

#### Authors: 1

- [@harryEth](https://github.com/harryEth)

---

# (Tue Sep 27 2022)

#### 🚀 Enhancement

- `@magic-sdk/types@8.1.0`
  - Harryxue sc 61854 m2 magic sdk support goerli testnet and release [#362](https://github.com/magiclabs/magic-js/pull/362) ([@harryEth](https://github.com/harryEth))

#### Authors: 1

- [@harryEth](https://github.com/harryEth)

---

# (Fri Sep 09 2022)

#### 🐛 Bug Fix

- `@magic-sdk/react-native@10.0.1`
  - Add RN TypedArray stringify conversion logic [#357](https://github.com/magiclabs/magic-js/pull/357) ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# (Thu Sep 01 2022)

#### 🐛 Bug Fix

- `@magic-ext/connect@2.0.2`
  - add options param to requestUserInfo [#342](https://github.com/magiclabs/magic-js/pull/342) ([@bcleary06](https://github.com/bcleary06))
- `@magic-ext/ed25519@0.0.2`
  - add @magic-ext/ed25519 [#346](https://github.com/magiclabs/magic-js/pull/346) ([@hcote](https://github.com/hcote) [@bcleary06](https://github.com/bcleary06))

#### Authors: 2

- Brian Cleary ([@bcleary06](https://github.com/bcleary06))
- Hunter Cote ([@hcote](https://github.com/hcote))

---

# (Wed Aug 10 2022)

#### 🚀 Enhancement

- `@magic-ext/react-native-oauth@3.1.0`
  - bump web-expo-browser version [#345](https://github.com/magiclabs/magic-js/pull/345) ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# (Fri Aug 05 2022)

#### 💥 Breaking Change

- `@magic-ext/connect@2.0.0`
  - initial commit for Connect Extenstion [#316](https://github.com/magiclabs/magic-js/pull/316) ([@bcleary06](https://github.com/bcleary06))
- `@magic-sdk/provider@9.0.0`, `@magic-sdk/react-native@10.0.0`, `@magic-sdk/types@8.0.0`
  - Revert "Revert "Enable bundle Id in Expo"" [#338](https://github.com/magiclabs/magic-js/pull/338) ([@Ethella](https://github.com/Ethella))
  - Enable bundle Id in Expo [#335](https://github.com/magiclabs/magic-js/pull/335) ([@Ethella](https://github.com/Ethella))

#### 🚀 Enhancement

- `@magic-ext/solana@5.0.0`
  - add signMessage for solana extension [#336](https://github.com/magiclabs/magic-js/pull/336) ([@hcote](https://github.com/hcote))

#### 🐛 Bug Fix

- `@magic-sdk/provider@9.0.0`, `@magic-sdk/react-native@10.0.0`, `@magic-sdk/types@8.0.0`
  - Update Readme and manual version bump for releases [#339](https://github.com/magiclabs/magic-js/pull/339) ([@Ethella](https://github.com/Ethella))
  - Revert "Enable bundle Id in Expo" [#337](https://github.com/magiclabs/magic-js/pull/337) ([@Ethella](https://github.com/Ethella))
- `@magic-ext/connect@2.0.0`
  - update copy [#319](https://github.com/magiclabs/magic-js/pull/319) ([@bcleary06](https://github.com/bcleary06))

#### Authors: 3

- Brian Cleary ([@bcleary06](https://github.com/bcleary06))
- Hunter Cote ([@hcote](https://github.com/hcote))
- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# (Wed Jun 29 2022)

#### 🐛 Bug Fix

- `@magic-ext/conflux@1.1.2`
  - update conflux constructor [#328](https://github.com/magiclabs/magic-js/pull/328) ([@hcote](https://github.com/hcote))

#### Authors: 1

- Hunter Cote ([@hcote](https://github.com/hcote))

---

# (Wed Apr 20 2022)

#### 🐛 Bug Fix

- `@magic-sdk/provider@8.1.1`, `@magic-sdk/types@7.1.1`
  - [Chore]: added `loginWithEmailOTP` method [#302](https://github.com/magiclabs/magic-js/pull/302) ([@adenekan41](https://github.com/adenekan41))

#### Authors: 1

- Adenekan Wonderful ([@adenekan41](https://github.com/adenekan41))

---

# (Tue Apr 12 2022)

#### 🚀 Enhancement

- `@magic-ext/taquito@0.2.0`
  - Update package.json [#307](https://github.com/magiclabs/magic-js/pull/307) ([@harryEth](https://github.com/harryEth))
  - taquito support [#306](https://github.com/magiclabs/magic-js/pull/306) ([@harryEth](https://github.com/harryEth))

#### Authors: 1

- [@harryEth](https://github.com/harryEth)

---

# (Fri Apr 08 2022)

#### 🚀 Enhancement

- `@magic-ext/terra@0.1.0`
  - terra support [#304](https://github.com/magiclabs/magic-js/pull/304) ([@harryEth](https://github.com/harryEth))
- `@magic-ext/cosmos@3.2.0`
  - Add cosmos change address function [#299](https://github.com/magiclabs/magic-js/pull/299) ([@harryEth](https://github.com/harryEth))

#### 🐛 Bug Fix

- add config to resolve an issue withauto/lerna inoperablitiy for npm n… [#303](https://github.com/magiclabs/magic-js/pull/303) ([@Ethella](https://github.com/Ethella))

#### Authors: 2

- [@harryEth](https://github.com/harryEth)
- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# (Mon Mar 07 2022)

#### 🚀 Enhancement

- `@magic-ext/flow@3.1.0`
  - Add flow domain tag feature support [#293](https://github.com/magiclabs/magic-js/pull/293) ([@harryEth](https://github.com/harryEth))
- `@magic-ext/algorand@3.1.0`
  - Add `signGroupTransactionV2` for Algorand [#260](https://github.com/magiclabs/magic-js/pull/260) (harry [@smithki](https://github.com/smithki) [@harryEth](https://github.com/harryEth))

#### 🏠 Internal

- Add documentation about Magic JS's build system [#274](https://github.com/magiclabs/magic-js/pull/274) ([@smithki](https://github.com/smithki))
- `@magic-ext/algorand@3.1.0`, `@magic-ext/harmony@3.1.0`, `@magic-ext/oauth@2.1.0`, `@magic-ext/polkadot@3.1.0`, `@magic-ext/tezos@3.1.0`, `@magic-ext/zilliqa@3.1.0`, `@magic-sdk/commons@4.1.0`, `@magic-sdk/pnp@2.1.0`, `@magic-sdk/provider@8.1.0`, `@magic-sdk/react-native@8.2.0`, `@magic-sdk/types@7.1.0`, `magic-sdk@8.1.0`
  - Internal documentation updates (`BUILD_SYSTEM.md`) [#283](https://github.com/magiclabs/magic-js/pull/283) ([@smithki](https://github.com/smithki))

#### Authors: 3

- [@harryEth](https://github.com/harryEth)
- harry (harry)
- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Mon Jan 31 2022)

#### 🚀 Enhancement

- `@magic-sdk/react-native@8.1.0`
  - Add special parsing logic to handle typed array in payload [#275](https://github.com/magiclabs/magic-js/pull/275) ([@Ethella](https://github.com/Ethella))

#### 🏠 Internal

- Add 'dev' script [#271](https://github.com/magiclabs/magic-js/pull/271) ([@smithki](https://github.com/smithki))

#### Authors: 2

- Ian K Smith ([@smithki](https://github.com/smithki))
- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# (Tue Jan 25 2022)

#### 🐛 Bug Fix

- `@magic-ext/algorand@3.0.1`, `@magic-ext/avalanche@3.0.1`, `@magic-ext/bitcoin@3.0.1`, `@magic-ext/cosmos@3.0.1`, `@magic-ext/flow@3.0.1`, `@magic-ext/harmony@3.0.1`, `@magic-ext/icon@3.0.1`, `@magic-ext/near@3.0.1`, `@magic-ext/oauth@2.0.1`, `@magic-ext/polkadot@3.0.1`, `@magic-ext/solana@4.0.1`, `@magic-ext/tezos@3.0.1`, `@magic-ext/webauthn@2.0.1`, `@magic-ext/zilliqa@3.0.1`, `magic-sdk@8.0.1`
  - Fix CDN build targets [#270](https://github.com/magiclabs/magic-js/pull/270) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Tue Jan 25 2022)

#### 💥 Breaking Change

- `@magic-ext/algorand@3.0.0`, `@magic-ext/avalanche@3.0.0`, `@magic-ext/bitcoin@3.0.0`, `@magic-ext/conflux@1.0.0`, `@magic-ext/cosmos@3.0.0`, `@magic-ext/flow@3.0.0`, `@magic-ext/harmony@3.0.0`, `@magic-ext/icon@3.0.0`, `@magic-ext/near@3.0.0`, `@magic-ext/oauth@2.0.0`, `@magic-ext/polkadot@3.0.0`, `@magic-ext/react-native-oauth@2.0.0`, `@magic-ext/solana@4.0.0`, `@magic-ext/tezos@3.0.0`, `@magic-ext/webauthn@2.0.0`, `@magic-ext/zilliqa@3.0.0`, `@magic-sdk/commons@4.0.0`, `@magic-sdk/pnp@2.0.0`, `@magic-sdk/provider@8.0.0`, `@magic-sdk/react-native@8.0.0`, `@magic-sdk/types@7.0.0`, `magic-sdk@8.0.0`
  - Switch from `microbundle` to `esbuild` [#220](https://github.com/magiclabs/magic-js/pull/220) ([@smithki](https://github.com/smithki))

#### Authors: 1

- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Mon Jan 24 2022)

#### 🐛 Bug Fix

- `@magic-ext/solana@3.0.1`
  - Fixing solana react native [#266](https://github.com/magiclabs/magic-js/pull/266) ([@bmeeder22](https://github.com/bmeeder22) [@smithki](https://github.com/smithki))
- `@magic-ext/conflux@0.1.1`
  - magic-conflux extension [#263](https://github.com/magiclabs/magic-js/pull/263) ([@hcote](https://github.com/hcote))

#### 🏠 Internal

- Update CI to build forked branches without ENV vars [#267](https://github.com/magiclabs/magic-js/pull/267) ([@smithki](https://github.com/smithki))

#### Authors: 3

- Ben Meeder ([@bmeeder22](https://github.com/bmeeder22))
- Hunter Cote ([@hcote](https://github.com/hcote))
- Ian K Smith ([@smithki](https://github.com/smithki))

---

# (Tue Dec 14 2021)

#### 💥 Breaking Change

- `@magic-sdk/types@6.0.0`, `magic-sdk@7.0.0`
  - Deprecate test API key [#252](https://github.com/magiclabs/magic-js/pull/252) (harry [@harryEth](https://github.com/harryEth))

#### Authors: 2

- [@harryEth](https://github.com/harryEth)
- harry (harry)

---

# (Fri Dec 10 2021)

#### 💥 Breaking Change

- `@magic-ext/algorand@1.0.0`, `@magic-ext/flow@1.0.0`, `@magic-ext/icon@1.0.0`, `@magic-ext/near@1.0.0`, `@magic-ext/polkadot@1.0.0`, `@magic-ext/tezos@1.0.0`
  - Jerryliu sc 44386 migrate web3 related magic ext repos to magic part 2 [#251](https://github.com/magiclabs/magic-js/pull/251) ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# (Thu Dec 09 2021)

#### 💥 Breaking Change

- `@magic-ext/avalanche@1.0.0`, `@magic-ext/cosmos@1.0.0`, `@magic-ext/harmony@1.0.0`, `@magic-ext/solana@2.0.0`, `@magic-ext/zilliqa@1.0.0`
  - Jerryliu sc 44386 migrate web3 related magic ext repos to magic (PART 1) [#248](https://github.com/magiclabs/magic-js/pull/248) ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

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

