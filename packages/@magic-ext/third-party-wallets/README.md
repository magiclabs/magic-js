# @magic-ext/third-party-wallets

A Magic SDK extension that delegates third-party wallet connections (MetaMask, Coinbase Wallet, Phantom, and Rabby) to an AppKit/Wagmi integration. Embedded-wallet surfaces the UX, and this extension bridges the iframe events to native wallet connectors running in the host dApp.

## Installation

```bash
yarn add @magic-ext/third-party-wallets
```

## Usage

```ts
import { Magic } from 'magic-sdk';
import { ThirdPartyWalletsExtension } from '@magic-ext/third-party-wallets';

const magic = new Magic('YOUR_API_KEY', {
  extensions: [new ThirdPartyWalletsExtension()],
});

// Once registered, embedded-wallet can trigger wallet flows via intermediary events.
```

> **Note**
> The current build hardcodes the demo AppKit project ID and default network set used in the `appkit-js-test` repo. Configuration hooks for production apps will be added in a future revision.

## Development

- The extension reuses the AppKit/Wagmi helpers in `src/appkit.ts`.
- `ThirdPartyWalletsExtension` listens for `ThirdPartyWalletEvents` emitted by embedded-wallet and forwards them to the appropriate Wagmi connector.
- Magic SDK’s `ThirdPartyWalletsModule` now routes RPC, metadata, and logout calls through the active external provider when one is connected.

Run tests from the repository root:

```bash
yarn test --filter third-party-wallets
```
