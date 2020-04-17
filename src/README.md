# Architectural Overview

## How the Magic `<iframe>` is Rendered

To balance performance with flexibility, one `<iframe>` is shared between all instances of `MagicSDK` containing the same "signature" of parameters. All options given to the `MagicSDK` constructor factor into this "signature," including the API key and (if present), custom Ethereum network configuration. This flexibility allows integrations to manage multiple instances of `MagicSDK`, which is an important feature for Web3 projects in particular.

> Note: the Magic `<iframe>` is _lazy loaded_ upon the first JSON RPC method call, or if `MagicSDK.preload` is explicitly invoked.

## Processing JSON RPC Payloads

There are numerous code paths that [`./modules`](./modules) can follow to interact with the Magic `<iframe>` context. Notably, the code path changes depending on use-case (such as when Web3 enters the picture). This section contains a high-level summary of each possible case.

### Case #1: Native modules (non-Web3)

```ts
// `magic.auth` and `magic.user` methods follow this pattern.
magic.user.getMetadata();

BaseModule.request -> PayloadTransport.post -> Window.postMessage -> iframe
```

### Case #2: Web3 `>=1.0.0-beta.38` using `send`

This represents the most current behavior of Web3:

```ts
web3.eth.sendTransaction(...);

RPCProviderModule.send -> BaseModule.request -> PayloadTransport.post -> Window.postMessage -> iframe
```

### Case #3: Web3 `<=1.0.0-beta.37` using `send`

This is an edge case affecting a small subset of Web3 pre-`1.x` beta versions:

```ts
web3.eth.sendTransaction(...);

RPCProviderModule.send -> BaseModule.sendAsync -> PayloadTransport.post -> Window.postMessage -> iframe
```

### Case #4: Legacy Web3 using `sendAsync`

This is the legacy behavior of Web3 providers, though it is still widely supported:

```ts
web3.eth.sendTransaction(...);

RPCProviderModule.sendAsync -> PayloadTransport.post -> Window.postMessage -> iframe
```
