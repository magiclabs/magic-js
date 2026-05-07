# 🔒 Magic Google One Tap for Web Browsers

[![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

> Magic Google One Tap JavaScript SDK extension. Renders Google's One Tap prompt on the dapp page and signs the user into Magic with the resulting Google ID token.

<p align="center">
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-ext/google-one-tap/LICENSE">License</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-ext/google-one-tap/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/CONTRIBUTING.md">Contributing Guide</a>
</p>

## 📖 Documentation

TODO once docs links are active.

## 🔗 Installation

Integrating your app with Magic will require our client-side NPM package and the Google One Tap extension:

```bash
# Via NPM:
npm install --save magic-sdk @magic-ext/google-one-tap

# Via Yarn:
yarn add magic-sdk @magic-ext/google-one-tap
```

Alternatively, you can load via CDN by adding a script tag to your app's `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/magic-sdk/dist/magic.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@magic-ext/google-one-tap/dist/extension.js"></script>
```

## ⚙️ Google Cloud setup

Google One Tap requires an OAuth 2.0 client ID issued by Google.

1. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** of type _Web application_ (or reuse the one you already use for "Sign in with Google").
2. Under **Authorized JavaScript origins**, add the exact origin(s) where the prompt will appear (for example, `https://your-app.com` and `http://localhost:3000` for local development). Google validates the displaying origin against this list before showing the prompt.
3. Copy the resulting client ID — you'll pass it as `googleClientId` below.

> One Tap only renders on `https` origins (and `http://localhost`). It will not display on insecure or unregistered origins.

## ⚡️ Quick Start

```ts
import { Magic } from 'magic-sdk';
import { GoogleOneTapExtension } from '@magic-ext/google-one-tap';

const magic = new Magic('YOUR_API_KEY', {
  extensions: [
    new GoogleOneTapExtension({
      googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      magicProviderId: 'YOUR_MAGIC_PROVIDER_ID',
      autoSelect: true,
    }),
  ],
  network: 'mainnet',
});

// Call when your app determines no user is signed in:
try {
  const didToken = await magic.googleOneTap.show();
  // didToken is a fresh Magic DID token for the signed-in user.
} catch (err) {
  // Prompt was suppressed, GSI failed to load, or verification rejected.
  console.error(err);
}

// Sign-out flow: prevent silent re-auth on the next page load.
magic.googleOneTap.disableAutoSelect();
```

## 🔧 Configuration options

| Option                | Type      | Default | Description                                                                                                          |
| --------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `googleClientId`      | `string`  | —       | **Required.** Google Cloud OAuth 2.0 client ID with the dapp origin allowlisted.                                     |
| `magicProviderId`     | `string`  | —       | **Required.** Magic federated identity provider ID configured for Google.                                            |
| `autoSelect`          | `boolean` | `false` | Sign returning users in without a click when there's a single eligible Google account.                               |
| `cancelOnTapOutside`  | `boolean` | `true`  | Dismiss the prompt when the user taps outside it.                                                                    |
| `useFedCM`            | `boolean` | `true`  | Let GSI use the FedCM browser API where available. Required for One Tap to render in modern Chrome.                  |
| `promptParentId`      | `string`  | —       | DOM element id to anchor the prompt to. Defaults to GSI's standard top-right placement.                              |
| `lifespan`            | `number`  | —       | Lifespan (in seconds) for the resulting Magic DID token.                                                             |
