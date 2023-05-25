import {
  AptosAccount,
  AptosClient,
  CoinClient,
  MaybeHexString,
  OptionalTransactionArgs,
  getAddressFromAccountOrAddress,
} from 'aptos';
import { AptosPayloadMethod, MagicUtils } from '../type';
import { convertBigIntToString } from '../utils/convertBigIntToString';
import { isAptosAccount } from '../utils/isAptosAccount';

export class MagicCoinClient extends CoinClient {
  readonly utils: MagicUtils;

  constructor(aptosClient: AptosClient, utils: MagicUtils) {
    super(aptosClient);

    this.utils = utils;
  }

  transfer = (
    from: AptosAccount | MaybeHexString,
    to: AptosAccount | MaybeHexString,
    amount: number | bigint,
    extraArgs?: OptionalTransactionArgs & {
      coinType?: string;
      createReceiverIfMissing?: boolean;
    },
  ): Promise<string> => {
    if (isAptosAccount(from)) {
      return this.transfer(from, to, amount, extraArgs);
    }

    const fromAddress = getAddressFromAccountOrAddress(from);
    const toArrdess = getAddressFromAccountOrAddress(to);

    return this.utils.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosCoinClientTransfer, [
        convertBigIntToString({
          from: fromAddress.hex(),
          to: toArrdess.hex(),
          amount,
          extraArgs,
        }),
      ]),
    );
  };
}
