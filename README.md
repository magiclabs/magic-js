# ✨ Magic Authentication JavaScript SDK

[![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

> Magic empowers developers to protect their users via an innovative, passwordless authentication flow without the UX compromises that burden traditional OAuth implementations.

<p align="center">
  <a href="./LICENSE">License</a> ·
  <a href="./CONTRIBUTING.md">Contributing Guide</a>
</p>

## 📖 Documentation

See the [developer documentation](https://docs.magic.link) to learn how you can master the Magic SDK in a matter of minutes.

## 📦 Package Ecosystem

| Package directory | Package Name | Changelog | Description |
| ----------------- | ------------ | ------- | ----------- |
| [`/web`](./packages/web) | [`magic-sdk`](https://www.npmjs.com/package/magic-sdk) | [CHANGELOG](./packages/web/CHANGELOG.md) | Web/browser entry-point for Magic SDK. |
| [`/react-native`](./packages/react-native) | [`@magic-sdk/react-native`](https://www.npmjs.com/package/@magic-sdk/react-native) | [CHANGELOG](./packages/react-native/CHANGELOG.md) | React Native entry-point for Magic SDK. |
| [`/types`](./packages/types) | [`@magic-sdk/types`](https://www.npmjs.com/package/@magic-sdk/types) | [CHANGELOG](./packages/types/CHANGELOG.md) | Core typings shared between JavaScript entry-points of Magic SDK. |
| [`/provider`](./packages/provider) | [`@magic-sdk/provider`](https://www.npmjs.com/package/@magic-sdk/provider) | [CHANGELOG](./packages/provider/CHANGELOG.md) | Core business logic shared between JavaScript entry-points of Magic SDK. |

## 🔗 Installation

Integrating your app with Magic will require our client-side NPM package:

```bash
# Via NPM:
npm install --save magic-sdk # If you're targeting web browsers
npm install --save @magic-sdk/react-native # If you're targeting React Native

# Via Yarn:
yarn add magic-sdk # If you're targeting web browsers
yarn add @magic-sdk/react-native # If you're targeting React Native
```

Alternatively, you can load via CDN with by adding a script tag to your app’s `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/magic-sdk/dist/magic.js"></script>
```

## ⚡️ Quick Start

Sign up or log in to the [developer dashboard](https://dashboard.magic.link) to receive API keys that will allow your application to interact with Magic's authentication APIs.

Then, you can start authenticating users with _just one method!_ Magic works across all modern desktop, mobile Chrome, Safari and Firefox browsers.

```ts
import { Magic } from 'magic-sdk';

const magic = new Magic('YOUR_API_KEY');

await magic.auth.loginWithMagicLink({ email: 'your.email@example.com' });
```
