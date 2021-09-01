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

BaseModule.request -> ViewController.post -> Window.postMessage -> iframe
```

### Case #2: Web3 `>=1.0.0-beta.38` using `send`

This represents the most current behavior of Web3:

```ts
web3.eth.sendTransaction(...);

RPCProviderModule.send -> BaseModule.request -> ViewController.post -> Window.postMessage -> iframe
```

### Case #3: Web3 `<=1.0.0-beta.37` using `send`

This is an edge case affecting a small subset of Web3 pre-`1.x` beta versions:

```ts
web3.eth.sendTransaction(...);

RPCProviderModule.send -> RPCProviderModule.sendAsync -> ViewController.post -> Window.postMessage -> iframe
```

### Case #4: Legacy Web3 using `sendAsync`

This is the legacy behavior of Web3 providers, though it is still widely supported:

```ts
web3.eth.sendTransaction(...);

RPCProviderModule.sendAsync -> ViewController.post -> Window.postMessage -> iframe
```

## React Native

We support web and React Native implementations from the same SDK. This introduces a few notable _gotchas:_

1. Do not reference any React dependencies at the top-level! Only use these dependencies within a closure (such as the body of a class method or function), and assume they could be `undefined`. We completely remove these dependencies from CJS and CDN bundles, so referencing these imports will raise a `TypeError`.

2. You can use the `IS_REACT_NATIVE` environment constant to gate browser-specific or React Native-specific APIs. Do not assume that all `window` functionality is available in a React Native context! It may be helpful to familiarize yourself with the [differences between React.js and React Native](https://medium.com/@alexmngn/from-reactjs-to-react-native-what-are-the-main-differences-between-both-d6e8e88ebf24).

3. See [`./noop-module.ts`](./noop-module.ts)? It's purposefully empty! Any dependencies that need removal from a specific environment's bundle is replaced with this module. Please don't change or remove this file!
