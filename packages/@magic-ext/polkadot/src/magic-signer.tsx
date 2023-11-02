import type { Signer } from '@polkadot/api/types';
import type { ISubmittableResult, SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { H256 } from '@polkadot/types/interfaces';
import { Extension, InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { PolkadotExtension } from '.';

type MagicInstnace = InstanceWithExtensions<SDKBase, [PolkadotExtension, ...Extension[]]>;

export class MagicSigner implements Signer {
  private magic: MagicInstnace;
  private nextId = 0;

  constructor(magic: MagicInstnace) {
    this.magic = magic;
  }

  /**
   * @description signs an extrinsic payload from a serialized form
   */
  signPayload = async (payload: SignerPayloadJSON) => {
    const signature = await this.magic.rpcProvider.send<string>('pdt_signPayload', [payload]);

    return {
      id: this.nextId++,
      signature: signature as HexString,
    };
  };
  /**
   * @description signs a raw payload, only the bytes data as supplied
   */
  signRaw = async (raw: SignerPayloadRaw) => {
    const signature = await this.magic.rpcProvider.send<HexString>('pdt_signRaw', [raw]);

    return {
      id: this.nextId++,
      signature,
    };
  };

  /**
   * @description Receives an update for the extrinsic signed by a `signer.sign`
   */
  update?: (id: number, status: H256 | ISubmittableResult) => void;
}
