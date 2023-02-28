# ✨ Magic JavaScript SDK

[![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

> The Magic JavaScript SDK empowers developers to provide frictionless web3 onboarding to their end-users while preserving their security and privacy using non-custodial wallets.

<p align="center">
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/magic-sdk/LICENSE">License</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/magic-sdk/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/CONTRIBUTING.md">Contributing Guide</a>
</p>

## 📖 Documentation

- See the [developer documentation](https://docs.magic.link) to learn how you can master the Magic SDK in a matter of minutes.
- See the `@magic-sdk/react-native-bare` [README](https://github.com/magiclabs/magic-js/tree/master/packages/%40magic-sdk/react-native-bare#readme) for Bare React Native package specific information.
- See the `@magic-sdk/react-native-expo` [README](https://github.com/magiclabs/magic-js/tree/master/packages/%40magic-sdk/react-native-expo#readme) for Expo React Native package specific information. 

## ⚡️ Quick Start

### Installation

Integrating your app with Magic will require our client-side NPM package:

```bash
# Via NPM:
npm install --save magic-sdk # If you're targeting web browsers
npm install --save @magic-sdk/react-native-bare # If you're targeting Bare React Native
npm install --save @magic-sdk/react-native-expo # If you're targeting Expo React Native

# Via Yarn:
yarn add magic-sdk # If you're targeting web browsers
yarn add @magic-sdk/react-native-bare # If you're targeting Bare React Native
yarn add @magic-sdk/react-native-expo # If you're targeting Expo React Native
```

Alternatively, you can load via CDN by adding a script tag to your app’s `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/magic-sdk/dist/magic.js"></script>
```

### Usage

Sign up or log in to the [developer dashboard](https://dashboard.magic.link) to receive API keys that will allow your application to interact with Magic's authentication APIs.

Then, you can start authenticating users with _just one method!_ Magic works across all modern desktop, mobile Chrome, Safari and Firefox browsers.

```ts
import { Magic } from "magic-sdk"
import Web3 from 'web3';

const magic = new Magic('YOUR_API_KEY', { 
  network: "goerli",
});

const web3 = new Web3(magic.rpcProvider);
const accounts = await magic.wallet.connectWithUI();
```

## 📦 Package Ecosystem

### Entry points

These are packages _you_ can install to enable Magic JS SDK functionality for your client-side application.

| Package Name | Changelog | Description |
| ------------ | --------- | ----------- |
| [`magic-sdk`](https://www.npmjs.com/package/magic-sdk) | [CHANGELOG](./packages/magic-sdk/CHANGELOG.md) | Web/browser entry-point for Magic SDK. |
| [`@magic-sdk/react-native-bare`](https://www.npmjs.com/package/@magic-sdk/react-native-bare) | [CHANGELOG](./packages/@magic-sdk/react-native-bare/CHANGELOG.md) | Bare React Native entry-point for Magic SDK. |
| [`@magic-sdk/react-native-expo`](https://www.npmjs.com/package/@magic-sdk/react-native-expo) | [CHANGELOG](./packages/@magic-sdk/react-native-expo/CHANGELOG.md) | Expo React Native entry-point for Magic SDK. |

## Extensions

Extend Magic JS SDK functionality for your use-case through [`@magic-ext/*` packages](./packages/@magic-ext).

### Internals

These are packages Magic JS SDK uses internally to work seamlessly across platforms.

| Package Name | Changelog | Description |
| ------------ | --------- | ----------- |
| [`@magic-sdk/types`](https://www.npmjs.com/package/@magic-sdk/types) | [CHANGELOG](./packages/@magic-sdk/types/CHANGELOG.md) | Core typings shared between JavaScript entry-points of Magic SDK. |
| [`@magic-sdk/pnp`](https://www.npmjs.com/package/@magic-sdk/pnp) | [CHANGELOG](./packages/@magic-sdk/pnp/CHANGELOG.md) | A lightweight connector that wraps Magic JS authentication with a beautiful, functional out-of-the-box login form. |
| [`@magic-sdk/provider`](https://www.npmjs.com/package/@magic-sdk/provider) | [CHANGELOG](./packages/@magic-sdk/provider/CHANGELOG.md) | Core business logic shared between JavaScript entry-points of Magic SDK. |
| [`@magic-sdk/commons`](https://www.npmjs.com/package/@magic-sdk/commons) | [CHANGELOG](./packages/@magic-sdk/commons/CHANGELOG.md) | Exposes a listing of common public APIs from `@magic-sdk/provider` and `@magic-sdk/types` to the platform-specific entry points. |
| [`@magic-sdk/types`](https://www.npmjs.com/package/@magic-sdk/types) | [CHANGELOG](./packages/@magic-sdk/types/CHANGELOG.md) | Core typings for Magic SDK packages. |

## 🚦 Testing

Run tests for all packages
```bash
yarn test
```

Test an individual package
```bash
PKG=magic-sdk yarn test
PKG=@magic-sdk/react-native-bare yarn test
PKG=@magic-sdk/react-native-expo yarn test
```

Test specific files
```bash
yarn test /test/**/constructor.spec.ts
```
