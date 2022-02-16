# 🔒 Magic OAuth Extension for Web Browsers

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
npm install --save magic-sdk @magic-ext/oauth

# Via Yarn:
yarn add magic-sdk @magic-ext/oauth
```

Alternatively, you can load via CDN with by adding a script tag to your app’s `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/magic-sdk/dist/magic.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@magic-ext/oauth/dist/extension.js"></script>
```

## ⚡️ Quick Start

Sign up or log in to the [developer dashboard](https://dashboard.magic.link) to receive API keys that will allow your application to interact with Magic's authentication APIs.

Then, you can start authenticating users with _just two method calls!_

From your login page:

```ts
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';

const magic = new Magic('YOUR_API_KEY', {
  extensions: [new OAuthExtension()]
});

await magic.oauth.loginWithRedirect({
  provider: 'google' | 'facebook' | 'github' | ...
});
```

From your OAuth callback page:

```ts
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';

const magic = new Magic('YOUR_API_KEY', {
  extensions: [new OAuthExtension()]
});

const res = await magic.oauth.getRedirectResult();

// Then you can access a user's Magic DID token, OAuth access token,
// OpenID Connect profile information, and more!
res.magic.idToken;
res.oauth.accessToken;
res.oauth.userInfo;
```
