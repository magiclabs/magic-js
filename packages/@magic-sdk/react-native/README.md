# ✨ Magic Authentication JavaScript SDK

[![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

> Magic empowers developers to protect their users via an innovative, passwordless authentication flow without the UX compromises that burden traditional OAuth implementations.

<p align="center">
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-sdk/react-native/LICENSE">License</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-sdk/react-native/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/CONTRIBUTING.md">Contributing Guide</a>
</p>

## Package Split!! 

Since `v9.0.0`, `@magic-sdk/react-native` package drops support of bare React Native (RN). You may stay on `^v8.0.0` to keep your bare RN app functional. With this in mind, bare React Native applications utlilizing OAuth should note that `@magic-ext/react-native-oauth` uses `expo-web-browser` as a dependency.

If this dependency causes you issues, consider enabling the expo library via `npx install-expo-modules@latest`. For more context, you may check: https://docs.expo.dev/bare/installing-expo-modules.

This package will mainly support **Expo** framework in future releases.

## 📖 Documentation

See the [developer documentation](https://magic.link/docs) to learn how you can master the Magic SDK in a matter of minutes.

## 🔗 Installation

Integrating your app with Magic will require our client-side NPM package:

```bash
# Via NPM:
npm install --save @magic-sdk/react-native

# Via Yarn:
yarn add @magic-sdk/react-native
```

## ⚡️ Quick Start

Sign up or log in to the [developer dashboard](https://dashboard.magic.link) to receive API keys that will allow your application to interact with Magic's authentication APIs.

Then, you can start authenticating users with _just one method!_

```tsx
import React from 'react';
import { Magic } from '@magic-sdk/react-native';

const magic = new Magic('YOUR_API_KEY');

export default function App() {
  return <>
    {/* Render the Magic iframe! */}
    <magic.Relayer />
    {...}
  </>
}

// Somewhere else in your code...
await magic.auth.loginWithMagicLink({ email: 'your.email@example.com' });
```
## 🙌🏾 Troubleshooting

### Symlinking in Monorepo w/ Metro (Expo Only)

For React Native projects living within a **monorepo** that run into the following `TypeError: Undefined is not an object` error: 

<img width="299" alt="Screenshot 2022-11-23 at 12 19 19 PM" src="https://user-images.githubusercontent.com/13407884/203641477-ec2e472e-86dc-4a22-b54a-eb694001617e.png">


When attempting to import `Magic`, take note that the React Native metro bundler doesn’t work well with symlinks, which tend to be utilized by most package managers. 

For this issue consider using Microsoft's [rnx-kit](https://microsoft.github.io/rnx-kit/docs/guides/bundling) suite of tools that include a plugin for metro that fixes this symlink related error. 
