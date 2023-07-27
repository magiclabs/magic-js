import browserEnv from '@ikscodes/browser-env';
import { BCS, TxnBuilderTypes } from 'aptos';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { AptosExtension, MagicAptosWallet } from '../../src';
import { APTOS_WALLET_NAME, ICON_BASE64 } from '../../src/constants';

const APTOS_NODE_URL = 'https://fullnode.testnet.aptoslabs.com';

const SAMPLE_ADDRESS = '0x8293d5e05544c6e53c47fc19ae071c26a60e0ccbd8a12eb5b2c9d348c85227b6';
const SAMPLE_TRANSACTION = {
  type: 'entry_function_payload',
  function: '0x1::coin::transfer',
  type_arguments: ['0x1::aptos_coin::AptosCoin'],
  arguments: ['0x8293d5e05544c6e53c47fc19ae071c26a60e0ccbd8a12eb5b2c9d348c85227b6', 1000],
};
const SAMPLE_BCS_TRANSACTION = new TxnBuilderTypes.TransactionPayloadEntryFunction(
  TxnBuilderTypes.EntryFunction.natural(
    '0x1::coin',
    'transfer',
    [TxnBuilderTypes.StructTag.fromString('0x1::aptos_coin::AptosCoin')],
    [
      BCS.bcsToBytes(
        TxnBuilderTypes.AccountAddress.fromHex('0x8293d5e05544c6e53c47fc19ae071c26a60e0ccbd8a12eb5b2c9d348c85227b6'),
      ),
      BCS.bcsSerializeUint64(1000),
    ],
  ),
);

const MOCK_ACCOUTN_INFO = {
  address: SAMPLE_ADDRESS,
  publicKey: 'test-public-key',
};

beforeEach(() => {
  browserEnv.restore();
});

test('Call connect()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.user.isLoggedIn = jest.fn().mockReturnValue(Promise.resolve(false));

  const mockAccountInfo = {
    address: SAMPLE_ADDRESS,
    publicKey: 'test-public-key',
  };

  const aptosWallet = new MagicAptosWallet(magic, {
    connect: () => {
      return Promise.resolve(mockAccountInfo);
    },
  });

  // Target method
  const accountInfo = await aptosWallet.connect();

  // Assert
  expect(magic.user.isLoggedIn).toBeCalledTimes(1);
  expect(accountInfo).toEqual(mockAccountInfo);
});

test('Call connect() without magic', async () => {
  const aptosWallet = new MagicAptosWallet(undefined);

  // Target method and assert
  expect(() => aptosWallet.connect()).rejects.toThrowError();
});

test('Call connect() without config.connect()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.user.isLoggedIn = jest.fn().mockReturnValue(Promise.resolve(false));
  magic.aptos.getAccountInfo = jest.fn().mockReturnValue(Promise.resolve(MOCK_ACCOUTN_INFO));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method and assert
  expect(() => aptosWallet.connect()).rejects.toThrowError();
});

test('Call connect() when a user has already logged in', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.user.isLoggedIn = jest.fn().mockReturnValue(Promise.resolve(true));
  magic.aptos.getAccountInfo = jest.fn().mockReturnValue(Promise.resolve(MOCK_ACCOUTN_INFO));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const accountInfo = await aptosWallet.connect();

  // Assert
  expect(accountInfo).toEqual(MOCK_ACCOUTN_INFO);
});

test('Call disconnect()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.user.logout = jest.fn().mockReturnValue(Promise.resolve(true));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  await aptosWallet.disconnect();

  // Assert
  expect(magic.user.logout).toBeCalledTimes(1);
});

test('Call disconnect() without magic', async () => {
  const aptosWallet = new MagicAptosWallet(undefined);

  // Target method and assert
  expect(() => aptosWallet.disconnect()).rejects.toThrowError();
});

test('Call account()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.aptos.getAccountInfo = jest.fn().mockReturnValue(Promise.resolve(MOCK_ACCOUTN_INFO));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const accountInfo = await aptosWallet.account();

  // Assert
  expect(magic.aptos.getAccountInfo).toBeCalledTimes(1);
  expect(accountInfo).toEqual(MOCK_ACCOUTN_INFO);
});

test('Call account() when a user has already logged in ', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.user.isLoggedIn = jest.fn().mockReturnValue(Promise.resolve(true));
  magic.aptos.getAccountInfo = jest.fn().mockReturnValue(Promise.resolve(MOCK_ACCOUTN_INFO));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  await aptosWallet.connect();
  const accountInfo = await aptosWallet.account();

  // Assert
  expect(magic.aptos.getAccountInfo).toBeCalledTimes(1);
  expect(accountInfo).toEqual(MOCK_ACCOUTN_INFO);
});

test('Call account() without magic', async () => {
  const aptosWallet = new MagicAptosWallet(undefined);

  // Target method and assert
  expect(() => aptosWallet.account()).rejects.toThrowError();
});

test('Call signTransaction()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);

  const mockResult = Uint8Array.from([1, 2, 3]);

  magic.aptos.getAccountInfo = jest.fn().mockReturnValue(Promise.resolve(MOCK_ACCOUTN_INFO));
  magic.aptos.signTransaction = jest.fn().mockReturnValue(Promise.resolve(mockResult));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const result = await aptosWallet.signTransaction(SAMPLE_TRANSACTION);

  // Assert
  expect(magic.aptos.getAccountInfo).toBeCalledTimes(1);
  expect(magic.aptos.signTransaction).toBeCalledTimes(1);
  expect(result).toEqual(mockResult);
});

test('Call signTransaction() without magic', async () => {
  const aptosWallet = new MagicAptosWallet(undefined);

  // Target method and assert
  expect(() => aptosWallet.signTransaction(SAMPLE_TRANSACTION)).rejects.toThrowError();
});

test('Call signAndSubmitTransaction()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);

  const mockResult = { hash: 'test-hash' };

  magic.aptos.getAccountInfo = jest.fn().mockReturnValue(Promise.resolve(MOCK_ACCOUTN_INFO));
  magic.aptos.signAndSubmitTransaction = jest.fn().mockReturnValue(Promise.resolve(mockResult));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const result = await aptosWallet.signAndSubmitTransaction(SAMPLE_TRANSACTION);

  // Assert
  expect(magic.aptos.getAccountInfo).toBeCalledTimes(1);
  expect(magic.aptos.signAndSubmitTransaction).toBeCalledTimes(1);
  expect(result).toEqual(mockResult);
});

test('Call signAndSubmitTransaction() without magic', async () => {
  const aptosWallet = new MagicAptosWallet(undefined);

  // Target method and assert
  expect(() => aptosWallet.signAndSubmitTransaction(SAMPLE_TRANSACTION)).rejects.toThrowError();
});

test('Call signAndSubmitBCSTransaction()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);

  const mockResult = { hash: 'test-hash' };

  magic.aptos.getAccountInfo = jest.fn().mockReturnValue(Promise.resolve(MOCK_ACCOUTN_INFO));
  magic.aptos.signAndSubmitBCSTransaction = jest.fn().mockReturnValue(Promise.resolve(mockResult));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const result = await aptosWallet.signAndSubmitBCSTransaction(SAMPLE_BCS_TRANSACTION);

  // Assert
  expect(magic.aptos.getAccountInfo).toBeCalledTimes(1);
  expect(magic.aptos.signAndSubmitBCSTransaction).toBeCalledTimes(1);
  expect(result).toEqual(mockResult);
});

test('Call signAndSubmitBCSTransaction() without magic', async () => {
  const aptosWallet = new MagicAptosWallet(undefined);

  // Target method and assert
  expect(() => aptosWallet.signAndSubmitBCSTransaction(SAMPLE_BCS_TRANSACTION)).rejects.toThrowError();
});

test('Call signMessage()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);

  const mockResult = {
    address: SAMPLE_ADDRESS,
    signature: 'test-signature',
    message: 'test-message',
    fullMessage: 'test-message',
    nonce: 'random-nonce',
    prefix: 'APTOS',
  };

  magic.aptos.getAccountInfo = jest.fn().mockReturnValue(Promise.resolve(MOCK_ACCOUTN_INFO));
  magic.aptos.signMessage = jest.fn().mockReturnValue(Promise.resolve(mockResult));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const result = await aptosWallet.signMessage({
    message: 'test-message',
    nonce: 'random-nonce',
  });

  // Assert
  expect(magic.aptos.getAccountInfo).toBeCalledTimes(1);
  expect(magic.aptos.signMessage).toBeCalledTimes(1);
  expect(result).toEqual(mockResult);
});

test('Call signMessage() without magic', async () => {
  const aptosWallet = new MagicAptosWallet(undefined);

  // Target method and assert
  expect(() =>
    aptosWallet.signMessage({
      message: 'test-message',
      nonce: 'random-nonce',
    }),
  ).rejects.toThrowError();
});

test('Call signMessageAndVerify()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);

  const mockResult = true;

  magic.aptos.getAccountInfo = jest.fn().mockReturnValue(Promise.resolve(MOCK_ACCOUTN_INFO));
  magic.aptos.signMessageAndVerify = jest.fn().mockReturnValue(Promise.resolve(mockResult));

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const result = await aptosWallet.signMessageAndVerify({
    message: 'test-message',
    nonce: 'random-nonce',
  });

  // Assert
  expect(magic.aptos.getAccountInfo).toBeCalledTimes(1);
  expect(magic.aptos.signMessageAndVerify).toBeCalledTimes(1);
  expect(result).toEqual(mockResult);
});

test('Call signMessageAndVerify() without magic', async () => {
  const aptosWallet = new MagicAptosWallet(undefined);

  // Target method and assert
  expect(() =>
    aptosWallet.signMessageAndVerify({
      message: 'test-message',
      nonce: 'random-nonce',
    }),
  ).rejects.toThrowError();
});

test('Set up with mainnet and call network()', async () => {
  const NODE_URL = 'https://fullnode.mainnet.aptoslabs.com';
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: NODE_URL,
    }),
  ]);

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const result = await aptosWallet.network();

  // Assert
  expect(result).toEqual({
    name: 'mainnet',
    chainId: '1',
    url: NODE_URL,
  });
});

test('Set up with testnet and call network()', async () => {
  const NODE_URL = 'https://fullnode.testnet.aptoslabs.com';
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: NODE_URL,
    }),
  ]);

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const result = await aptosWallet.network();

  // Assert
  expect(result).toEqual({
    name: 'testnet',
    chainId: '2',
    url: NODE_URL,
  });
});

test('Set up with devnet and call network()', async () => {
  const NODE_URL = 'https://fullnode.devnet.aptoslabs.com';
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: NODE_URL,
    }),
  ]);

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const result = await aptosWallet.network();

  // Assert
  expect(result).toEqual({
    name: 'devnet',
    url: NODE_URL,
  });
});

test('Set up with an invalid network and call network()', async () => {
  const NODE_URL = 'https://fullnode.invalid.aptoslabs.com';
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: NODE_URL,
    }),
  ]);

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method and assert
  expect(() => aptosWallet.network()).rejects.toThrowError();
});

test('Call network() without magic', async () => {
  const aptosWallet = new MagicAptosWallet(undefined);

  // Target method and assert
  expect(() => aptosWallet.network()).rejects.toThrowError();
});

test('Call wallet()', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);

  const aptosWallet = new MagicAptosWallet(magic);

  // Target method
  const result = await aptosWallet.wallet();

  // Assert
  expect(result).toEqual({
    name: APTOS_WALLET_NAME,
    url: 'https://magic.link/',
    icon: ICON_BASE64,
  });
});

test('Call onNetworkChange', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);

  const aptosWallet = new MagicAptosWallet(magic);

  const callback = jest.fn();

  // Target method
  await aptosWallet.onNetworkChange(callback);

  // Assert
  expect(callback).toBeCalledTimes(1);
});

test('Call onAccountChange', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);

  const aptosWallet = new MagicAptosWallet(magic);

  const callback = jest.fn();

  // Target method
  await aptosWallet.onAccountChange(callback);

  // Assert
  expect(callback).toBeCalledTimes(1);
});
