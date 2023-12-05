# v4.3.2 (Tue Nov 28 2023)

#### 🐛 Bug Fix

- Merge branch 'master' into josh-sc-90794-add-types-export-to-scaffolding ([@joshuascan](https://github.com/joshuascan))

#### Authors: 1

- Josh Scanlan ([@joshuascan](https://github.com/joshuascan))

---

# v4.3.1 (Tue Nov 21 2023)

#### 🐛 Bug Fix

- Fix TypeScript resolution for @magic-ext/* packages when using modern module resolution (node16 etc) [#670](https://github.com/magiclabs/magic-js/pull/670) ([@rjwebb](https://github.com/rjwebb) [@joshuascan](https://github.com/joshuascan))
- Merge branch 'master' into rjwebb/669-fix-node16-magic-ext-imports ([@joshuascan](https://github.com/joshuascan))
- Update package.json exports to expose types when using node16 typescript, for algorand, auth, avalanche, bitcoin, conflux, cosmos, ed25519, flow, gdkms, harmony, hedera, icon, near, oauth, oidc, polkadot, react-native-bare-oauth, react-native-expo-oauth, taquito, terra, tezos, webauthn and zilliqa ([@rjwebb](https://github.com/rjwebb))

#### Authors: 2

- Bob Webb ([@rjwebb](https://github.com/rjwebb))
- Josh Scanlan ([@joshuascan](https://github.com/joshuascan))

---

# v4.2.1 (Tue Nov 14 2023)

#### 🐛 Bug Fix

- Merge branch 'master' into injectable-webcrypto-jwt-for-session-persistence ([@Dizigen](https://github.com/Dizigen))

#### Authors: 1

- David He ([@Dizigen](https://github.com/Dizigen))

---

# v4.2.0 (Tue Oct 24 2023)

#### 🐛 Bug Fix

- Merge branch 'master' into hcote-support-sepolia-natively ([@hcote](https://github.com/hcote))

#### Authors: 1

- Hunter Cote ([@hcote](https://github.com/hcote))

---

# v4.0.0 (Fri Oct 13 2023)

#### 🐛 Bug Fix

- Merge branch 'master' into force-ctor-preload-iframe ([@Dizigen](https://github.com/Dizigen))

#### Authors: 1

- David He ([@Dizigen](https://github.com/Dizigen))

---

# v3.1.1 (Mon Oct 02 2023)

#### 🐛 Bug Fix

- Merge branch 'master' into patjacobs-sc-83016-ux-optimization-expired-email-otps ([@patjacobs-magic](https://github.com/patjacobs-magic))

#### Authors: 1

- [@patjacobs-magic](https://github.com/patjacobs-magic)

---

# v3.1.0 (Fri Sep 29 2023)

#### 🐛 Bug Fix

- Merge remote-tracking branch 'origin/master' into jerryliu-sc-87830-optimize-webcrypto-implementation-to-generate ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# v3.0.0 (Thu Sep 14 2023)

#### 💥 Breaking Change

- Jerryliu sc 83009 deprecate updatephonenumber in sdk [#598](https://github.com/magiclabs/magic-js/pull/598) ([@Ethella](https://github.com/Ethella) [@chrisdakin-magic](https://github.com/chrisdakin-magic))

#### 🐛 Bug Fix

- Removing updatePhoneNumber API ([@Ethella](https://github.com/Ethella))

#### Authors: 2

- Chris Dakin ([@chrisdakin-magic](https://github.com/chrisdakin-magic))
- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# v2.4.0 (Thu Sep 14 2023)

#### 🚀 Enhancement

- Jayhwang sc 86422 implement magic wallet sendgaslesstxn [#622](https://github.com/magiclabs/magic-js/pull/622) ([@octave08](https://github.com/octave08))

#### 🐛 Bug Fix

- Remove gasEndpoint and nftEndpoint ([@octave08](https://github.com/octave08))
- Add sendGaslessTransaction api ([@octave08](https://github.com/octave08))

#### Authors: 1

- Jay Hwang ([@octave08](https://github.com/octave08))

---

# v2.3.0 (Wed Aug 16 2023)

#### 🐛 Bug Fix

- Merge branch 'master' into josh-sc-75022-standalone-update-email-v2 ([@joshuascan](https://github.com/joshuascan))

#### Authors: 1

- Josh Scanlan ([@joshuascan](https://github.com/joshuascan))

---

# v2.2.0 (Fri Aug 11 2023)

#### 🚀 Enhancement

- no need to check for sdk platform here. [#605](https://github.com/magiclabs/magic-js/pull/605) ([@Dizigen](https://github.com/Dizigen))

#### 🐛 Bug Fix

- no need to check for sdk platform here. ([@Dizigen](https://github.com/Dizigen))

#### Authors: 1

- David He ([@Dizigen](https://github.com/Dizigen))

---

# v2.1.0 (Tue Aug 08 2023)

#### 🚀 Enhancement

- Jerryliu sc 81984 update loginwithemailotp interface with new [#596](https://github.com/magiclabs/magic-js/pull/596) ([@dependabot[bot]](https://github.com/dependabot[bot]) [@Ariflo](https://github.com/Ariflo) [@Ethella](https://github.com/Ethella))

#### 🐛 Bug Fix

- Update IntermediaryEvents ([@Ethella](https://github.com/Ethella))
- Update Event handlers ([@Ethella](https://github.com/Ethella))
- Update events ([@Ethella](https://github.com/Ethella))
- Merge remote-tracking branch 'origin/master' into jerryliu-sc-81984-update-loginwithemailotp-interface-with-new ([@Ethella](https://github.com/Ethella))
- Merge remote-tracking branch 'origin/master' ([@Ethella](https://github.com/Ethella))

#### Authors: 3

- [@dependabot[bot]](https://github.com/dependabot[bot])
- Arian Flores ([@Ariflo](https://github.com/Ariflo))
- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# v2.0.0 (Thu Jul 27 2023)

#### 💥 Breaking Change

- Magic SDK Node version bump [#538](https://github.com/magiclabs/magic-js/pull/538) ([@makrandgupta](https://github.com/makrandgupta))

#### 🐛 Bug Fix

- remove unnecessary externals, bring peer deps up to date ([@makrandgupta](https://github.com/makrandgupta))
- missing provider package ([@makrandgupta](https://github.com/makrandgupta))

#### Authors: 1

- Makrand Gupta ([@makrandgupta](https://github.com/makrandgupta))

---

# v1.6.0 (Wed Jul 26 2023)

#### 🚀 Enhancement

- Deeplinked wallet methods [#594](https://github.com/magiclabs/magic-js/pull/594) ([@Dizigen](https://github.com/Dizigen))

#### 🐛 Bug Fix

- Remove React-native entry from @magic-ext/auth Package.json [#595](https://github.com/magiclabs/magic-js/pull/595) ([@Ariflo](https://github.com/Ariflo))
- Remove react-native attribute from Package.json ([@Ariflo](https://github.com/Ariflo))

#### Authors: 2

- Arian Flores ([@Ariflo](https://github.com/Ariflo))
- David He ([@Dizigen](https://github.com/Dizigen))

---

# v1.5.0 (Mon Jul 24 2023)

#### 🚀 Enhancement

- Add optional nftEndpoint param [#586](https://github.com/magiclabs/magic-js/pull/586) ([@octave08](https://github.com/octave08))

#### 🐛 Bug Fix

- Merge branch 'master' into jayhwang-sc-81912-add-optional-nftendpoint-param ([@octave08](https://github.com/octave08))
- Add optional nftEndPoint param ([@octave08](https://github.com/octave08))

#### Authors: 1

- Jay Hwang ([@octave08](https://github.com/octave08))

---

# v1.3.0 (Fri Jul 07 2023)

#### ⚠️ Pushed to `master`

- Merge remote-tracking branch 'origin/master' ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# v1.2.0 (Fri Jun 23 2023)

#### 🚀 Enhancement

- Auto version bumping [#557](https://github.com/magiclabs/magic-js/pull/557) ([@Ethella](https://github.com/Ethella) [@Ariflo](https://github.com/Ariflo))
- Updates License to Apache 2.0 [#551](https://github.com/magiclabs/magic-js/pull/551) ([@Ariflo](https://github.com/Ariflo))

#### 🐛 Bug Fix

- Match NPM Version ([@Ariflo](https://github.com/Ariflo))
- Update CHANGELOG.md \[skip ci\] ([@Ethella](https://github.com/Ethella))
- Replace `magic-sdk` w/ `@magic-sdk/commons` for `@magic-ext/oidc` Package [#550](https://github.com/magiclabs/magic-js/pull/550) ([@Ariflo](https://github.com/Ariflo))
- Updates License to Apache 2.0 ([@Ariflo](https://github.com/Ariflo))
- Merge branch 'master' into briancleary7114-sc-80045-remove-approval-step-for-canary-releases ([@bcleary06](https://github.com/bcleary06))
- Fix CI Tests [#552](https://github.com/magiclabs/magic-js/pull/552) ([@Ariflo](https://github.com/Ariflo))
- DRYify isMajorVersionAtLeast ([@Ariflo](https://github.com/Ariflo))

#### Authors: 3

- Arian Flores ([@Ariflo](https://github.com/Ariflo))
- Brian Cleary ([@bcleary06](https://github.com/bcleary06))
- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# v1.1.0 (Fri Jun 23 2023)

#### 🚀 Enhancement

- Updates License to Apache 2.0 [#551](https://github.com/magiclabs/magic-js/pull/551) ([@Ariflo](https://github.com/Ariflo))

#### 🐛 Bug Fix

- Replace `magic-sdk` w/ `@magic-sdk/commons` for `@magic-ext/oidc` Package [#550](https://github.com/magiclabs/magic-js/pull/550) ([@Ariflo](https://github.com/Ariflo))
- Updates License to Apache 2.0 ([@Ariflo](https://github.com/Ariflo))
- Merge branch 'master' into briancleary7114-sc-80045-remove-approval-step-for-canary-releases ([@bcleary06](https://github.com/bcleary06))
- Fix CI Tests [#552](https://github.com/magiclabs/magic-js/pull/552) ([@Ariflo](https://github.com/Ariflo))
- DRYify isMajorVersionAtLeast ([@Ariflo](https://github.com/Ariflo))

#### Authors: 2

- Arian Flores ([@Ariflo](https://github.com/Ariflo))
- Brian Cleary ([@bcleary06](https://github.com/bcleary06))

---

# v1.0.0 (Tue Jun 20 2023)

#### 💥 Breaking Change

- Removes Magic link Method [#516](https://github.com/magiclabs/magic-js/pull/516) ([@Ariflo](https://github.com/Ariflo))

#### 🐛 Bug Fix

- Add isMajorVersionAtLeast directly to auth extension ([@Ariflo](https://github.com/Ariflo))
- Move isMajorVersionAtLeast to commons ([@Ariflo](https://github.com/Ariflo))
- Throw error if loginWithMagicLink used in RN packages v19.0.0 or higher ([@Ariflo](https://github.com/Ariflo))

#### Authors: 1

- Arian Flores ([@Ariflo](https://github.com/Ariflo))

---

# v0.4.0 (Fri May 26 2023)

#### 🐛 Bug Fix

- Merge remote-tracking branch 'origin/master' into jerryliu_hotfix_gdkms ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# v0.2.5 (Fri May 19 2023)

#### 🐛 Bug Fix

- Merge remote-tracking branch 'origin/master' into jerryliu-sc-77755-kresus-hotfix ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# v0.2.2 (Tue Apr 25 2023)

#### 🐛 Bug Fix

- Srinjoy/add logo to readme [#501](https://github.com/magiclabs/magic-js/pull/501) ([@srinjoyc](https://github.com/srinjoyc) [@hcote](https://github.com/hcote))
- quick fix passing authorization token in payload [#502](https://github.com/magiclabs/magic-js/pull/502) ([@Ethella](https://github.com/Ethella))
- quick fix passing authorization token in payload ([@Ethella](https://github.com/Ethella))

#### Authors: 3

- Hunter Cote ([@hcote](https://github.com/hcote))
- Jerry Liu ([@Ethella](https://github.com/Ethella))
- Srinjoy ([@srinjoyc](https://github.com/srinjoyc))

---

# v0.2.1 (Fri Apr 21 2023)

#### 🐛 Bug Fix

- Merge remote-tracking branch 'origin/master' into jerryliu-sc-75641-lazer-request-showsettings-page-mfa ([@Ethella](https://github.com/Ethella))

#### Authors: 1

- Jerry Liu ([@Ethella](https://github.com/Ethella))

---

# v0.2.0 (Thu Apr 20 2023)

#### 🚀 Enhancement

- product consolidated SDK + deprecation warnings [#497](https://github.com/magiclabs/magic-js/pull/497) ([@Dizigen](https://github.com/Dizigen))

#### Authors: 1

- David He ([@Dizigen](https://github.com/Dizigen))

---

