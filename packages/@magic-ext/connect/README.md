# 🔒 Magic Connect Extension for Web Browsers

[![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

> Magic Connect JavaScript SDK extension.

<p align="center">
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-ext/connect/LICENSE">License</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-ext/connect/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/CONTRIBUTING.md">Contributing Guide</a>
</p>

## 📖 Documentation

See the [developer documentation](https://magic.link/docs/connect) to learn how to get started with Connect in Magic SDK.

## 🔗 Installation

Integrating your app with Magic will require our client-side NPM package and the Connect extension:

```bash
# Via NPM:
npm install --save magic-sdk @magic-ext/connect

# Via Yarn:
yarn add magic-sdk @magic-ext/connect
```

Alternatively, you can load via CDN with by adding a script tag to your app’s `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/magic-sdk/dist/magic.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@magic-ext/connect/dist/extension.js"></script>
```

## ⚡️ Quick Start

Sign up or log in to the [developer dashboard](https://dashboard.magic.link) to receive API keys that will allow your application to interact with Magic's APIs.

From your login page:

```ts
import Web3 from 'web3';
import { Magic } from 'magic-sdk';
import { ConnectExtension } from '@magic-ext/connect';

const magic = new Magic('YOUR_API_KEY', {
  extensions: [new ConnectExtension()],
  network: 'mainnet' // 'mainnet' or 'testnet'
});

const web3 = new Web3(magic.rpcProvider);

await web3.eth.getAccounts();
```
