# Magic Extension Tezos blockchain

## Installation
```bash
npm i magic-sdk @magic-ext/tezos
```
## Setup
Setup TezosExtension with magic-sdk
```js

import { Magic } from 'magic-sdk';
import { TezosExtension } from '@magic-ext/tezos';

const magic = new Magic('YOUR_API_KEY', {
    extensions: [
        new TezosExtension({
            rpcUrl: 'tezos rpc url'
        })
    ]
});

// or


const magic = new Magic('YOUR_API_KEY', {
    extensions: {
        tezos: new TezosExtension({
            rpcUrl: 'tezos rpc url'
        })
    }
});

```

## Magic SDK
See the [developer documentation](https://magic.link/docs) to learn how you can master the Magic SDK in a matter of minutes.


## Usage

### Get account
Using getAccount function to get Tezos public address for current user.

```js
const publicAddress = await magic.tezos.getAccount();
console.log('tezos public address', publicAddress);
```

### Send Transaction
```js
const handlerSendTransaction = async () => {

    const result = await magic.tezos.sendTransactionOperation('tz1RVcUP9nUurgEJMDou8eW3bVDs6qmP5Lnc', 500000, 1500, '');
    console.log(`Injected operation group id ${result.operationGroupID}`);
};
```

### Send Delegation
```js
const handleSendDelegation = async () => {
    const result = await magic.tezos.sendDelegationOperation('tz1LhS2WFCinpwUTdUb991ocL2D9Uk6FJGJK', 10000);
    console.log(`Injected operation group id`, result);
}
```

### Send Contract Origination
```js
const handleSendContractOrigination = async () => {
          const contract = `[
        {
           "prim":"parameter",
           "args":[ { "prim":"string" } ]
        },
        {
           "prim":"storage",
           "args":[ { "prim":"string" } ]
        },
        {
           "prim":"code",
           "args":[
              [
                 { "prim":"CAR" },
                 { "prim":"NIL", "args":[ { "prim":"operation" } ] },
                 { "prim":"PAIR" }
              ]
           ]
        }
     ]`;
          const storage = '{"string": "Sample"}';


          const params = {
              amount: 0,
              delegate: undefined,
              fee: 100000,
              derivationPath: '',
              storage_limit: 1000,
              gas_limit: 100000,
              code: contract,
              storage,
              codeFormat: 'micheline',
          }

          const result = await magic.tezos.sendContractOriginationOperation(
              params.amount,
              params.delegate,
              params.fee,
              params.derivationPath,
              params.storage_limit,
              params.gas_limit,
              params.code,
              params.storage,
              params.codeFormat
          );
          console.log(`Injected operation`, result);
};
```

### Send Contract Invocation
```js
const handleInvokeContract = async () => {

      const params = {
          contract: 'KT1NXXLzk3rwnawPc4HwDn8siPkMaBjT5Hdr',
          amount: 0,
          fee: 100000,
          derivationPath: '',
          storageLimit: 1000,
          gasLimit: 100000,
          entrypoint: '',
          parameters: '{"string": "Cryptonomicon"}',
          parameterFormat: 'micheline'
      };

      const result = await magic.tezos.sendContractInvocationOperation(
          params.contract,
          params.amount,
          params.fee,
          params.derivationPath,
          params.storageLimit,
          params.gasLimit,
          params.entrypoint,
          params.parameters,
          params.parameterFormat
      );
      console.log(`Injected operation`, result);
};
```

### Send Contract Ping
```js
const handleContractPing = async () => {

      const params = {
          contract: 'KT1NXXLzk3rwnawPc4HwDn8siPkMaBjT5Hdr',
          amount: 10000,
          fee: 100000,
          derivationPath: '',
          storageLimit: 1000,
          gasLimit: 100000,
          entrypoint: ''
      };

      const result = await magic.tezos.sendContractPing(
          params.contract,
          params.amount,
          params.fee,
          params.derivationPath,
          params.storageLimit,
          params.gasLimit,
          params.entrypoint,
      );

      console.log(`Injected operation`, result);
}
```
