## Architectural Overview

There are numerous code paths that modules follow to interact with the `<iframe>` relayer. Notably, this code path changes depending on use-case (especially when Web3 enters the picture). Here's a simple overview of the code paths from a high-level to low-level:

### Case #1: Native modules (non-Web3)

```ts
// `magic.auth` and `magic.user` follow this pattern.
magic.user.getMetadata();

BaseModule.request -> PayloadTransport.post -> Window.postMessage -> iframe
```

### Case #2: Legacy Web3 using `sendAsync`

```ts
web3.eth.sendTransaction(...);

RPCProviderModule.sendAsync -> PayloadTransport.post -> Window.postMessage -> iframe
```

### Case #3: Web3 `>=1.0.0-beta.38` using `send`

```ts
web3.eth.sendTransaction(...);

RPCProviderModule.send -> BaseModule.request -> PayloadTransport.post -> Window.postMessage -> iframe
```

### Case #4: Web3 `<=1.0.0-beta.37` using `send`

```ts
web3.eth.sendTransaction(...);

RPCProviderModule.send -> BaseModule.sendAsync -> PayloadTransport.post -> Window.postMessage -> iframe
```
