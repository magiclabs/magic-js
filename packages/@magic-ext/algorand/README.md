# Magic Extension Algorand Blockchain

## Installation
```bash
npm i magic-sdk @magic-ext/algorand
```
## Setup
Setup AlgorandExtension with magic-sdk
```js

import { Magic } from 'magic-sdk';
import { AlgorandExtension } from '@magic-ext/algorand';

const magic = new Magic('YOUR_API_KEY', {
    extensions: [
        new AlgorandExtension({
            rpcUrl: 'algorand rpc url'
        })
    ]
});

// or 

const magic = new Magic('YOUR_API_KEY', {
    extensions: {
        algorand: new AlgorandExtension({
            rpcUrl: 'algorand rpc url'
        })
    }
});

```

## Magic SDK
See the [developer documentation](https://magic.link/docs) to learn how you can master the Magic SDK in a matter of minutes.


## Usage

### Get Wallet
Using getWallet function to get Algorand public address for current user.

```js
const publicAddress = await magic.algorand.getWallet();
console.log('algorand public address', publicAddress);
```

### Sign Transaction
By passing txnObj instance to `magic.algorand.signTransaction()` method, it will automatically sign the transaction with current user and
generate transaction object including signature.
```js
      const txn = {
          "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
          "fee": 10,
          "amount": 50,
          "firstRound": 51,
          "lastRound": 61,
          "genesisID": "devnet-v33.0",
          "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
          "closeRemainderTo": "IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA",
          "note": new Uint8Array(Buffer.from("6gAVR0Nsv5Y=", "base64"))
      };

      const tx = await magic.algorand.signTransaction(txn);

      console.log('signed transaction', tx)
```

### Sign Bid
By passing txnObj instance to `magic.algorand.signBid()` method, it will automatically sign the bid with current user and
generate transaction object including signature.
 ```js
          const bid = {
              "bidderKey": "IB3NJALXLDX5JLYCD4TMTMLVCKDRZNS4JONHMIWD6XM7DSKYR7MWHI6I7U",
              "auctionKey": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
              "bidAmount": 1000,
              "maxPrice": 10,
              "bidID": 2,
              "auctionID": 56
          };

          const tx = await magic.algorand.signBid(bid);

          console.log('send bid', tx)
 ```
