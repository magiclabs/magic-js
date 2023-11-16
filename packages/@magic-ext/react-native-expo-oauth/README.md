




# 🔒 Magic OAuth Extension for React Native (Expo)

[![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

> With the Magic JavaScript SDK OAuth extension, you can plug into your favorite social login providers with one, easy-to-use API.

<p align="center">
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-ext/oauth/LICENSE">License</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-ext/oauth/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/CONTRIBUTING.md">Contributing Guide</a>
</p>

## 📖 Documentation

See the [developer documentation](https://magic.link/docs/social-login) to learn how to get started with OAuth in Magic SDK.

## 🔗 Installation

Integrating your app with OAuth will require our client-side NPM package and OAuth extension:

```bash
# Via NPM:
npm install --save @magic-ext/react-native-expo-oauth

# Via Yarn:
yarn add @magic-ext/react-native-expo-oauth
```
### ⚠️ This library can only be used on an Expo project that uses [@magic-sdk/react-native-expo](https://github.com/magiclabs/magic-js/tree/master/packages/%40magic-sdk/react-native-expo).

## ⚡️ Quick Start

Sign up or log in to the [developer dashboard](https://dashboard.magic.link ) to receive API keys that will allow your application to interact with Magic's authentication APIs.

Then, you can start authenticating users with _just one method!_

```tsx
import React from 'react';
import { Magic } from '@magic-sdk/react-native-expo';
import { OAuthExtension } from "@magic-ext/react-native-expo-oauth";
import { SafeAreaProvider } from 'react-native-safe-area-context';

const magic = new Magic(apiKey, {
    endpoint: 'https://box.magic.link',
    extensions: [
        new OAuthExtension()
    ],
});

export default function App() {
    return <>
        <SafeAreaProvider>
            {/* Render the Magic iframe! */}
            <magic.Relayer />
            {...}
        </SafeAreaProvider>
    </>
}

// Somewhere else in your code...
await magic.auth.loginWithEmailOTP({ email: 'your.email@example.com' });
```
⁠⁠👉 Check out some of our [React Native Demo apps](https://github.com/magiclabs/react-native-demo) for inspiration! 👀
