# 🔒 Magic Open Id Connect for Bare React Native

[![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

> Magic Open Id Connect Bare React Native SDK extension.

<p align="center">
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-ext/react-native-bare-oidc/LICENSE">License</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-ext/react-native-bare-oidc/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/CONTRIBUTING.md">Contributing Guide</a>
</p>

## 📖 Documentation

TODO once docs links are active.

## 🔗 Installation

Integrating your Bare React Native app with Magic will require our client-side NPM package and the Bare React Native OIDC extension:

```bash
# Via NPM:
npm install --save @magic-sdk/react-native-bare @magic-ext/react-native-bare-oidc

# Via Yarn:
yarn add @magic-sdk/react-native-bare @magic-ext/react-native-bare-oidc
```

## ⚡️ Quick Start

Sign up or log in to the [developer dashboard](https://dashboard.magic.link) to receive API keys that will allow your application to interact with Magic's APIs.

Request access to this feature sending the API key you want enabled to our customer support.

From your login page:

```ts
import Web3 from 'web3';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/react-native-bare-oidc';

const magic = new Magic('YOUR_API_KEY', {
  extensions: [new OpenIdExtension()],
  network: 'mainnet', // 'mainnet' or 'testnet'
});

const DID = await magic.openid.loginWithOIDC({
  jwt: myOpenIdJwt,
  providerId: myProviderId,
});

const web3 = new Web3(magic.rpcProvider);
await web3.eth.getAccounts();
```
