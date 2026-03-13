# @magic-ext/siwe

Magic SDK extension for Sign-In with Ethereum (SIWE/EIP-4361) authentication.

## Installation

```bash
npm install @magic-ext/siwe
```

## Usage

```typescript
import { Magic } from 'magic-sdk';
import { SiweExtension } from '@magic-ext/siwe';

const magic = new Magic('YOUR_API_KEY', {
  extensions: [new SiweExtension()],
});

// Generate nonce
const { nonce } = await magic.siwe.generateNonce();

// OR

// Generate complete message
const message = await magic.siwe.generateMessage({
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  chainId: 1,
});

// Login with message and signature
const publicAddress = await magic.siwe.login({
  message,
  signature: '0x7d5f8c9e...',
});
```

## Methods

### `generateNonce()`

Generate a nonce for SIWE message construction..

### `generateMessage(params)`

Generate a complete SIWE message. Constructs the message client-side using the siwe library.

### `login(params)`

Login with SIWE message and signature. Used for both flows.
