# Magic Extension Polkadot Blockchain

## Installation
```bash
npm i magic-sdk @magic-ext/polkadot
```
## Setup
Setup PolkadotExtension with magic-sdk 
```js

import { Magic } from 'magic-sdk';
import { PolkadotExtension } from '@magic-ext/polkadot';

const magic = new Magic('YOUR_API_KEY', {
    extensions: [
        new PolkadotExtension({
            rpcUrl: 'polkadot rpc url'
        })
    ]
});

// or

const magic = new Magic('YOUR_API_KEY', {
    extensions: {
        polkadot: new PolkadotExtension({
            rpcUrl: 'polkadot rpc url'
        })
    }
});

```

## Magic SDK
See the [developer documentation](https://magic.link/docs) to learn how you can master the Magic SDK in a matter of minutes.


## Usage

### Get account
Using getAccount function to get Polkadot public address for current user.

```js
const publicAddress = await magic.polkadot.getAccount();
console.log('icon public address', publicAddress);
```

### Send Transaction
Send polkadot native currency

```js
      const handlerSendTransaction = async () => {

          const tx = await magic.polkadot.sendTransaction(
              '5H3pELHbg9skXE2HfLqP23UPgrgu2Juj55CH6sdDGWc2HKNs',
              1000000000000000,
          );

          console.log('transaction hash', tx)
      };

```

### Call contract function as transaction

```js
    const handlerContractCall = async () => {

          const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:9944/') });
          await api.isReady;
          const abi = new Abi(api.registry, contractABI);

          const data = abi.messages.flip();

          const tx = await magic.polkadot.contractCall('5C52CfgkwANdFuN3VgPSprQwNWKfkLWMHJbMRzp12h4YarCa', 0, 1000000, data);

          console.log('transaction hash', tx)
      }
```
