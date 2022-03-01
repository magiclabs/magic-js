# Magic Extension Harmony Blockchain

## Installation
```bash
npm i magic-sdk @magic-ext/harmony
```
## Setup
Setup HarmonyExtension with magic-sdk
```js

import { Magic } from 'magic-sdk';
import { HarmonyExtension } from '@magic-ext/harmony';

const magic = new Magic('YOUR_API_KEY', {
    extensions: [
        new HarmonyExtension({
            rpcUrl: 'harmony rpc url'
        })
    ]
});

// or

const magic = new Magic('YOUR_API_KEY', {
    extensions: {
        hmy: new HarmonyExtension({
            rpcUrl: 'harmony rpc url'
        })
    }
});

```

## Magic SDK
See the [developer documentation](https://magic.link/docs) to learn how you can master the Magic SDK in a matter of minutes.


## Usage

### Send Transaction
By passing transaction payload to `magic.harmony.sendTransaction()` method, it will automatically sign the transaction with current user and
 generate transaction object including signature, then send to Harmony node.
```js
  const params = {
      //  token send to
      to: 'one1jzxhswufkh7wgyq7s49u3rvp9vlts8wcwsq8y2',
      // amount to send
      value: '50000',
      // gas limit, you can use string
      gasLimit: '210000',
      // send token from shardID
      shardID: 0,
      // send token to toShardID
      toShardID: 0,
      // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
      gasPrice: 1000000000,
  }

  const tx = await magic.harmony.sendTransaction(params)

  console.log(tx)
```

### Deploy Contract
By passing deploy contract payload to `magic.harmony.sendTransaction()` method, it will automatically sign the transaction with current user and
 generate transaction object including signature, then send to Harmony node.

```js
  const bin = '608060405234801561001057600080fd5b5060c68061001f6000396000f3fe6080604052348015600f576000' +
      '80fd5b506004361060325760003560e01c80636057361d146037578063b05784b8146062575b600080fd5b6060600480' +
      '36036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b60686088565b60405180' +
      '82815260200191505060405180910390f35b8060008190555050565b6000805490509056fea265627a7a723158209e86' +
      '9bf97eba094ccf7533f0f92b4de32cf3cce7d7cff974769bca975e178b0164736f6c63430005110032';


  const contractBytecode = {
      data: `0x${bin}`,
      gasLimit: '210000',
      // send token from shardID
      shardID: 0,
      // send token to toShardID
      toShardID: 0,
      // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
      gasPrice: 1000000000,
      arguments: []
  };

const tx = await magic.harmony.sendTransaction(contractBytecode);

console.log(tx)
```

### Contract Send
By passing contract send payload to `magic.harmony.sendTransaction()` method, it will automatically sign the transaction with current user and
 generate transaction object including signature, then send to Harmony node.
 ```js
const deployedContract = harmony.contracts.createContract(
    contractAbi,
    contractAddress
);

const tx = await deployedContract.methods.store(900);

let { txPayload } = tx.transaction;

txPayload.from = "one1jzxhswufkh7wgyq7s49u3rvp9vlts8wcwsq8y2";
txPayload.gasLimit = '210000';
txPayload.gasPrice = '1000000000';


const txn = await magic.harmony.sendTransaction(txPayload)

console.log(txn)
```
