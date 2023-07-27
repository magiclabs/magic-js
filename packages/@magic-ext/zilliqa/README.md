# Magic Extension Zilliqa blockchain

## Installation 
```bash
npm i magic-sdk @magic-ext/zilliqa
```
## Setup
Setup TezosExtension with magic-sdk
```js

import { Magic } from 'magic-sdk';
import { ZilliqaExtension } from '@magic-ext/zilliqa';
const { BN, Long, bytes, units } = require('@zilliqa-js/util');

const magic = new Magic('YOUR_API_KEY', {
    extensions: [
        new ZilliqaExtension({
            rpcUrl: 'zilliqa rpc url'
        })
    ]
});

// or


const magic = new Magic('YOUR_API_KEY', {
    extensions: {
        zilliqa: new ZilliqaExtension({
            rpcUrl: 'zilliqa rpc url'
        })
    }
});

```

## Magic SDK
See the [developer documentation](https://magic.link/docs) to learn how you can master the Magic SDK in a matter of minutes.


## Usage

### Get wallet
Using wallet function to get Zilliqa public key, and address for current user.

```js
const wallet = await magic.zilliqa.getWallet();
console.log('zilliqa wallet', wallet);
```

### Send Transaction
```js
      const handlerSendTransaction = async () => {

          const chainId = 333; // chainId of the developer testnet
          const msgVersion = 1; // current msgVersion
          const VERSION = bytes.pack(chainId, msgVersion);

          const myGasPrice = units.toQa('1000', units.Units.Li);

          const params = {
              version: VERSION,
              toAddr: "zil14vut0rh7q78ydc0g7yt7e5zkfyrmmps00lk6r7",
              amount: (new BN(units.toQa('0.5', units.Units.Zil))), // Sending an amount in Zil (1) and converting the amount to Qa
              gasPrice: myGasPrice, // Minimum gasPrice veries. Check the `GetMinimumGasPrice` on the blockchain
              gasLimit: Long.fromNumber(1),
          };

          const tx = await magic.zil.sendTransaction(
              params,
              false,
          );

          console.log('send transaction', tx)
      };
```

### Deploy Contract
```js
const handleDeployContract = async () => {
          const wallet = await magic.zil.getWallet();

          const address = wallet.address;

          const code = `scilla_version 0

    (* HelloWorld contract *)

    import ListUtils

    (***************************************************)
    (*               Associated library                *)
    (***************************************************)
    library HelloWorld

    let not_owner_code = Int32 1
    let set_hello_code = Int32 2

    (***************************************************)
    (*             The contract definition             *)
    (***************************************************)

    contract HelloWorld
    (owner: ByStr20)

    field welcome_msg : String = ""

    transition setHello (msg : String)
      is_owner = builtin eq owner _sender;
      match is_owner with
      | False =>
        e = {_eventname : "setHello()"; code : not_owner_code};
        event e
      | True =>
        welcome_msg := msg;
        e = {_eventname : "setHello()"; code : set_hello_code};
        event e
      end
    end


    transition getHello ()
        r <- welcome_msg;
        e = {_eventname: "getHello()"; msg: r};
        event e
    end`;

          const init = [
              // this parameter is mandatory for all init arrays
              {
                  vname: '_scilla_version',
                  type: 'Uint32',
                  value: '0',
              },
              {
                  vname: 'owner',
                  type: 'ByStr20',
                  value: `${address}`,
              },
          ];

          const chainId = 333; // chainId of the developer testnet
          const msgVersion = 1; // current msgVersion
          const VERSION = bytes.pack(chainId, msgVersion);

          const myGasPrice = units.toQa('1000', units.Units.Li);

          const params = {
              version: VERSION,
              gasPrice: myGasPrice,
              gasLimit: Long.fromNumber(10000),
          }

          const result = await magic.zil.deployContract(
              init, code, params, 33, 1000, false
          )


          console.log('deploy contract', result);


      };
```

### Call Contract
```js
      const handleCallContract = async () => {

          const newMsg = 'Hello, test call contract' ;

          const chainId = 333; // chainId of the developer testnet
          const msgVersion = 1; // current msgVersion
          const VERSION = bytes.pack(chainId, msgVersion);

          const myGasPrice = units.toQa('1000', units.Units.Li);

          const params = {
              // amount, gasPrice and gasLimit must be explicitly provided
              version: VERSION,
              amount: new BN(0),
              gasPrice: myGasPrice,
              gasLimit: Long.fromNumber(8000),
          }

          const args = [
              {
                  vname: 'msg',
                  type: 'String',
                  value: newMsg,
              },
          ];

          const contractAddress = '0x92867f6C65933bADB3F3e02A36Cf3ad85fE5155b';

            const result = await magic.zil.callContract(
                'setHello', args, params, 33, 1000, false, contractAddress
            );

          console.log('call contract', result)

      };
```
