import browserEnv from '@ikscodes/browser-env';
import { BCS, TxnBuilderTypes } from 'aptos';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { AptosExtension } from '../../src';
import { AptosPayloadMethod } from '../../src/type';

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
const MESSAGE_PAYLOAD = {
  message: 'Hello Aptos Extension!',
  nonce: 'random-nonce',
};

beforeEach(() => {
  browserEnv.restore();
});

test('Construct GetAccount request with `aptos_getAccount`', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.aptos.request = jest.fn();

  // Target method
  await magic.aptos.getAccount();

  // Assert
  expect(magic.aptos.request).toBeCalledTimes(1);

  const requestPayload = magic.aptos.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(AptosPayloadMethod.AptosGetAccount);
  expect(requestPayload.params).toEqual([]);
});

test('Construct GetAccountInfo request with `aptos_getAccountInfo`', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.aptos.request = jest.fn().mockReturnValueOnce(SAMPLE_ADDRESS);

  // Target method
  await magic.aptos.getAccountInfo();

  // Assert
  expect(magic.aptos.request).toBeCalledTimes(2);

  const requestPayload = magic.aptos.request.mock.calls[1][0];
  expect(requestPayload.method).toBe(AptosPayloadMethod.AptosGetAccountInfo);
  expect(requestPayload.params).toEqual([
    {
      address: SAMPLE_ADDRESS,
    },
  ]);
});

test('Construct SignTransaction request with `aptos_signTransaction`', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.aptos.request = jest.fn();

  // Target method
  await magic.aptos.signTransaction(SAMPLE_ADDRESS, SAMPLE_TRANSACTION);

  // Assert
  expect(magic.aptos.request).toBeCalledTimes(1);

  const requestPayload = magic.aptos.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(AptosPayloadMethod.AptosSignTransaction);
  expect(requestPayload.params).toHaveLength(1);
  expect(requestPayload.params[0]).toEqual(
    expect.objectContaining({
      address: SAMPLE_ADDRESS,
    }),
  );
  expect(requestPayload.params[0].transactionBytes).toBeInstanceOf(Uint8Array);
});

test('Construct SignTransaction request with invalid payload type`', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.aptos.request = jest.fn();

  // Assert
  expect(() =>
    magic.aptos.signTransaction(SAMPLE_ADDRESS, {
      ...SAMPLE_TRANSACTION,
      type: 'test',
    }),
  ).rejects.toThrowError();
});

test('Construct SignAndSubmitTransaction request with `aptos_signAndSubmitTransaction`', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.aptos.request = jest.fn();

  // Target method
  await magic.aptos.signAndSubmitTransaction(SAMPLE_ADDRESS, SAMPLE_TRANSACTION);

  // Assert
  expect(magic.aptos.request).toBeCalledTimes(1);

  const requestPayload = magic.aptos.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(AptosPayloadMethod.AptosSignAndSubmitTransaction);
  expect(requestPayload.params).toHaveLength(1);
  expect(requestPayload.params[0]).toEqual(
    expect.objectContaining({
      address: SAMPLE_ADDRESS,
    }),
  );
  expect(requestPayload.params[0].transactionBytes).toBeInstanceOf(Uint8Array);
});

test('Construct SignAndSubmitBCSTransaction request with `aptos_signAndSubmitBCSTransaction`', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.aptos.request = jest.fn();

  // Target method
  await magic.aptos.signAndSubmitBCSTransaction(SAMPLE_ADDRESS, SAMPLE_BCS_TRANSACTION);

  // Assert
  expect(magic.aptos.request).toBeCalledTimes(1);

  const requestPayload = magic.aptos.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(AptosPayloadMethod.AptosSignAndSubmitBCSTransaction);
  expect(requestPayload.params).toHaveLength(1);
  expect(requestPayload.params[0]).toEqual(
    expect.objectContaining({
      address: SAMPLE_ADDRESS,
    }),
  );
  expect(requestPayload.params[0].transactionBytes).toBeInstanceOf(Uint8Array);
});

test('Construct SignMessage request with `aptos_signMessage`', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.aptos.request = jest.fn();

  // Target method
  await magic.aptos.signMessage(SAMPLE_ADDRESS, MESSAGE_PAYLOAD);

  // Assert
  expect(magic.aptos.request).toBeCalledTimes(1);

  const requestPayload = magic.aptos.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(AptosPayloadMethod.AptosSignMessage);
  expect(requestPayload.params).toHaveLength(1);
  expect(requestPayload.params).toEqual([
    {
      address: SAMPLE_ADDRESS,
      message: MESSAGE_PAYLOAD,
    },
  ]);
});

test('Construct SignMessageAndVerify request with `aptos_signMessageAndVerify`', async () => {
  const magic = createMagicSDKWithExtension({}, [
    new AptosExtension({
      nodeUrl: APTOS_NODE_URL,
    }),
  ]);
  magic.aptos.request = jest.fn();

  // Target method
  await magic.aptos.signMessageAndVerify(SAMPLE_ADDRESS, MESSAGE_PAYLOAD);

  // Assert
  expect(magic.aptos.request).toBeCalledTimes(1);

  const requestPayload = magic.aptos.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(AptosPayloadMethod.AptosSignMessageAndVerify);
  expect(requestPayload.params).toHaveLength(1);
  expect(requestPayload.params).toEqual([
    {
      address: SAMPLE_ADDRESS,
      message: MESSAGE_PAYLOAD,
    },
  ]);
});
