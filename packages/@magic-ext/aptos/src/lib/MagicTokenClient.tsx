import {
  AptosAccount,
  AptosClient,
  BCS,
  CoinClient,
  HexString,
  MaybeHexString,
  OptionalTransactionArgs,
  TokenClient,
  TxnBuilderTypes,
  Types,
  getAddressFromAccountOrAddress,
} from 'aptos';
import { AptosPayloadMethod, MagicUtils } from '../type';
import { convertBigIntToString } from '../utils/convertBigIntToString';
import { isAptosAccount } from '../utils/isAptosAccount';

export class MagicTokenClient extends TokenClient {
  readonly utils: MagicUtils;

  constructor(aptosClient: AptosClient, utils: MagicUtils) {
    super(aptosClient);

    this.utils = utils;
  }

  burnByCreator = (
    creator: AptosAccount | MaybeHexString,
    ownerAddress: MaybeHexString,
    collection: String,
    name: String,
    PropertyVersion: BCS.AnyNumber,
    amount: BCS.AnyNumber,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(creator)) {
      return this.burnByCreator(creator, ownerAddress, collection, name, PropertyVersion, amount, extraArgs);
    }

    const creatorAddress = getAddressFromAccountOrAddress(creator);
    const ownerAddressHex = getAddressFromAccountOrAddress(ownerAddress).hex();

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientBurnByCreator, [
        convertBigIntToString({
          creator: creatorAddress.hex(),
          owner: ownerAddressHex,
          collection,
          name,
          PropertyVersion,
          amount,
          extraArgs,
        }),
      ]),
    );
  };

  burnByOwner = (
    owner: AptosAccount | MaybeHexString,
    creatorAddress: MaybeHexString,
    collection: String,
    name: String,
    PropertyVersion: BCS.AnyNumber,
    amount: BCS.AnyNumber,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(owner)) {
      return this.burnByOwner(owner, creatorAddress, collection, name, PropertyVersion, amount, extraArgs);
    }

    const ownerAddress = getAddressFromAccountOrAddress(owner);
    const creatorAddressHex = getAddressFromAccountOrAddress(creatorAddress).hex();

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientBurnByOwner, [
        convertBigIntToString({
          owner: ownerAddress.hex(),
          creator: creatorAddressHex,
          collection,
          name,
          PropertyVersion,
          amount,
          extraArgs,
        }),
      ]),
    );
  };

  cancelTokenOffer = (
    account: AptosAccount | MaybeHexString,
    receiver: MaybeHexString,
    creator: MaybeHexString,
    collectionName: string,
    name: string,
    property_version?: number,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(account)) {
      return this.cancelTokenOffer(account, receiver, creator, collectionName, name, property_version, extraArgs);
    }

    const accountAddress = getAddressFromAccountOrAddress(account);
    const receiverAddress = getAddressFromAccountOrAddress(receiver);
    const creatorAddress = getAddressFromAccountOrAddress(creator);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientCancelTokenOffer, [
        convertBigIntToString({
          account: accountAddress.hex(),
          receiver: receiverAddress.hex(),
          creator: creatorAddress.hex(),
          collectionName,
          name,
          property_version,
          extraArgs,
        }),
      ]),
    );
  };

  claimToken = (
    account: AptosAccount,
    sender: MaybeHexString,
    creator: MaybeHexString,
    collectionName: string,
    name: string,
    property_version?: number,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(account)) {
      return this.claimToken(account, sender, creator, collectionName, name, property_version, extraArgs);
    }

    const accountAddress = getAddressFromAccountOrAddress(account);
    const senderAddress = getAddressFromAccountOrAddress(sender);
    const creatorAddress = getAddressFromAccountOrAddress(creator);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientClaimToken, [
        convertBigIntToString({
          account: accountAddress.hex(),
          sender: senderAddress.hex(),
          creator: creatorAddress.hex(),
          collectionName,
          name,
          property_version,
          extraArgs,
        }),
      ]),
    );
  };

  createCollection = (
    account: AptosAccount,
    name: string,
    description: string,
    uri: string,
    maxAmount?: BCS.AnyNumber,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(account)) {
      return this.createCollection(account, name, description, uri, maxAmount, extraArgs);
    }

    const accountAddress = getAddressFromAccountOrAddress(account);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientCreateCollection, [
        convertBigIntToString({
          account: accountAddress.hex(),
          name,
          description,
          uri,
          maxAmount,
          extraArgs,
        }),
      ]),
    );
  };

  createToken = (
    account: AptosAccount,
    collectionName: string,
    name: string,
    description: string,
    supply: number,
    uri: string,
    max?: BCS.AnyNumber,
    royalty_payee_address?: MaybeHexString,
    royalty_points_denominator?: number,
    royalty_points_numerator?: number,
    property_keys?: string[],
    property_values?: string[],
    property_types?: string[],
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(account)) {
      return this.createToken(
        account,
        collectionName,
        name,
        description,
        supply,
        uri,
        max,
        royalty_payee_address,
        royalty_points_denominator,
        royalty_points_numerator,
        property_keys,
        property_values,
        property_types,
        extraArgs,
      );
    }

    const accountAddress = getAddressFromAccountOrAddress(account);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientCreateToken, [
        convertBigIntToString({
          account: accountAddress.hex(),
          collectionName,
          name,
          description,
          supply,
          uri,
          max,
          royalty_payee_address,
          royalty_points_denominator,
          royalty_points_numerator,
          property_keys,
          property_values,
          property_types,
          extraArgs,
        }),
      ]),
    );
  };

  createTokenWithMutabilityConfig = (
    account: AptosAccount,
    collectionName: string,
    name: string,
    description: string,
    supply: BCS.AnyNumber,
    uri: string,
    max?: BCS.AnyNumber,
    royalty_payee_address?: MaybeHexString,
    royalty_points_denominator?: BCS.AnyNumber,
    royalty_points_numerator?: BCS.AnyNumber,
    property_keys?: string[],
    property_values?: Uint8Array[],
    property_types?: string[],
    mutability_config?: boolean[],
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(account)) {
      return this.createTokenWithMutabilityConfig(
        account,
        collectionName,
        name,
        description,
        supply,
        uri,
        max,
        royalty_payee_address,
        royalty_points_denominator,
        royalty_points_numerator,
        property_keys,
        property_values,
        property_types,
        mutability_config,
        extraArgs,
      );
    }

    const accountAddress = getAddressFromAccountOrAddress(account);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientCreateTokenWithMutabilityConfig, [
        convertBigIntToString({
          account: accountAddress.hex(),
          collectionName,
          name,
          description,
          supply,
          uri,
          max,
          royalty_payee_address,
          royalty_points_denominator,
          royalty_points_numerator,
          property_keys,
          property_values,
          property_types,
          mutability_config,
          extraArgs,
        }),
      ]),
    );
  };

  // https://aptos-labs.github.io/ts-sdk-doc/classes/TokenClient.html#directTransferToken
  // directTransferToken = this.directTransferToken;

  mutateTokenProperties = (
    account: AptosAccount,
    tokenOwner: HexString,
    creator: HexString,
    collection_name: string,
    tokenName: string,
    propertyVersion: BCS.AnyNumber,
    amount: BCS.AnyNumber,
    keys: string[],
    values: Uint8Array[],
    types: string[],
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(account)) {
      return this.mutateTokenProperties(
        account,
        tokenOwner,
        creator,
        collection_name,
        tokenName,
        propertyVersion,
        amount,
        keys,
        values,
        types,
        extraArgs,
      );
    }

    const accountAddress = getAddressFromAccountOrAddress(account);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientMutateTokenProperties, [
        convertBigIntToString({
          account: accountAddress.hex(),
          tokenOwner,
          creator,
          collection_name,
          tokenName,
          propertyVersion,
          amount,
          keys,
          values,
          types,
          extraArgs,
        }),
      ]),
    );
  };

  offerToken = (
    account: AptosAccount,
    receiver: MaybeHexString,
    creator: MaybeHexString,
    collectionName: string,
    name: string,
    amount: number,
    property_version?: number,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(account)) {
      return this.offerToken(account, receiver, creator, collectionName, name, amount, property_version, extraArgs);
    }

    const accountAddress = getAddressFromAccountOrAddress(account);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientOfferToken, [
        convertBigIntToString({
          account: accountAddress.hex(),
          receiver,
          creator,
          collectionName,
          name,
          amount,
          property_version,
          extraArgs,
        }),
      ]),
    );
  };

  optInTokenTransfer = (sender: AptosAccount, optIn: boolean, extraArgs?: OptionalTransactionArgs): Promise<string> => {
    if (isAptosAccount(sender)) {
      return this.optInTokenTransfer(sender, optIn, extraArgs);
    }

    const accountAddress = getAddressFromAccountOrAddress(sender);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientOptInTokenTransfer, [
        convertBigIntToString({
          account: accountAddress.hex(),
          optIn,
          extraArgs,
        }),
      ]),
    );
  };

  transferWithOptIn = (
    sender: AptosAccount,
    creator: MaybeHexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: BCS.AnyNumber,
    receiver: MaybeHexString,
    amount: BCS.AnyNumber,
    extraArgs?: OptionalTransactionArgs,
  ): Promise<string> => {
    if (isAptosAccount(sender)) {
      return this.transferWithOptIn(
        sender,
        creator,
        collectionName,
        tokenName,
        propertyVersion,
        receiver,
        amount,
        extraArgs,
      );
    }

    const accountAddress = getAddressFromAccountOrAddress(sender);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosTokenClientTransferWithOptIn, [
        convertBigIntToString({
          account: accountAddress.hex(),
          creator,
          collectionName,
          tokenName,
          propertyVersion,
          receiver,
          amount,
          extraArgs,
        }),
      ]),
    );
  };
}
