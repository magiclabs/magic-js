import {
  AptosAccount,
  AptosClient,
  BCS,
  CoinClient,
  MaybeHexString,
  OptionalTransactionArgs,
  TxnBuilderTypes,
  Types,
  getAddressFromAccountOrAddress,
  HexString,
} from 'aptos';
import { AptosPayloadMethod, MagicUtils } from '../type';
import { convertBigIntToString } from '../utils/convertBigIntToString';
import { isAptosAccount } from '../utils/isAptosAccount';

export class MagicAptosClient extends AptosClient {
  readonly utils: MagicUtils;

  constructor(nodeUrl: string, utils: MagicUtils) {
    super(nodeUrl);

    this.utils = utils;
  }

  generateSignSubmitTransaction = (
    sender: AptosAccount | MaybeHexString,
    payload: TxnBuilderTypes.TransactionPayload,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(sender)) {
      return this.generateSignSubmitTransaction(sender, payload, extraArgs);
    }

    const senderAddress = getAddressFromAccountOrAddress(sender);

    const s = new BCS.Serializer();
    payload.serialize(s);
    const serializedPayload = s.getBytes();

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosAptosClientGenerateSignSubmitTransaction, [
        convertBigIntToString({
          sender: senderAddress.hex(),
          payload: serializedPayload,
          extraArgs,
        }),
      ]),
    );
  };

  generateSignSubmitWaitForTransaction = (
    sender: AptosAccount | MaybeHexString,
    payload: TxnBuilderTypes.TransactionPayload,
    extraArgs?: OptionalTransactionArgs & {
      checkSuccess?: boolean;
      timeoutSecs?: number;
    },
  ): Promise<Types.Transaction> => {
    if (isAptosAccount(sender)) {
      return this.generateSignSubmitWaitForTransaction(sender, payload, extraArgs);
    }

    const senderAddress = getAddressFromAccountOrAddress(sender);

    const s = new BCS.Serializer();
    payload.serialize(s);
    const serializedPayload = s.getBytes();

    return this.utils.request<Types.Transaction>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosAptosClientGenerateSignSubmitWaitForTransaction, [
        convertBigIntToString({
          sender: senderAddress.hex(),
          payload: serializedPayload,
          extraArgs,
        }),
      ]),
    );
  };

  publishPackage = (
    sender: AptosAccount | MaybeHexString,
    packageMetadata: Uint8Array,
    modules: BCS.Seq<TxnBuilderTypes.Module>,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(sender)) {
      return this.publishPackage(sender, packageMetadata, modules, extraArgs);
    }

    const senderAddress = getAddressFromAccountOrAddress(sender);

    const s = new BCS.Serializer();
    const serializedSeq = modules.map((m) => {
      m.serialize(s);
      return s.getBytes();
    });

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosAptosClientPublishPackage, [
        convertBigIntToString({
          sender: senderAddress.hex(),
          packageMetadata,
          modules: serializedSeq,
          extraArgs,
        }),
      ]),
    );
  };

  rotateAuthKeyEd25519 = (
    forAccount: AptosAccount | MaybeHexString,
    toPrivateKeyBytes: Uint8Array,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<Types.PendingTransaction> => {
    if (isAptosAccount(forAccount)) {
      return this.rotateAuthKeyEd25519(forAccount, toPrivateKeyBytes, extraArgs);
    }

    const senderAddress = getAddressFromAccountOrAddress(forAccount);

    return this.utils.request<Types.PendingTransaction>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosAptosClientRotateAuthKeyEd25519, [
        convertBigIntToString({
          sender: senderAddress.hex(),
          toPrivateKeyBytes,
          extraArgs,
        }),
      ]),
    );
  };

  signTransaction = (
    accountFrom: AptosAccount | MaybeHexString,
    rawTransaction: TxnBuilderTypes.RawTransaction,
  ): Promise<Uint8Array> => {
    if (isAptosAccount(accountFrom)) {
      return this.signTransaction(accountFrom, rawTransaction);
    }

    const address = getAddressFromAccountOrAddress(accountFrom);

    const s = new BCS.Serializer();
    rawTransaction.serialize(s);
    const serializedRawTransaction = s.getBytes();

    return this.utils.request<Uint8Array>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignTransaction, [
        convertBigIntToString({
          accountFrom,
          rawTransaction: serializedRawTransaction,
        }),
      ]),
    );
  };

  simulateTransaction = (
    accountOrPubkey:
      | TxnBuilderTypes.Ed25519PublicKey
      | TxnBuilderTypes.MultiEd25519PublicKey
      | AptosAccount
      | MaybeHexString,
    rawTransaction: TxnBuilderTypes.RawTransaction,
    query?: {
      estimateGasUnitPrice?: boolean;
      estimateMaxGasAmount?: boolean;
      estimatePrioritizedGasUnitPrice: boolean;
    },
  ): Promise<Types.UserTransaction[]> => {
    if (typeof accountOrPubkey === 'string' || accountOrPubkey instanceof HexString) {
      const address = getAddressFromAccountOrAddress(accountOrPubkey);

      const s = new BCS.Serializer();
      rawTransaction.serialize(s);
      const serializedRawTransaction = s.getBytes();

      return this.utils.request<Types.UserTransaction[]>(
        this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosAptosClientSimultateTransaction, [
          convertBigIntToString({
            accountFrom: address,
            rawTransaction: serializedRawTransaction,
            query,
          }),
        ]),
      );
    }

    return this.simulateTransaction(accountOrPubkey, rawTransaction, query);
  };
}
