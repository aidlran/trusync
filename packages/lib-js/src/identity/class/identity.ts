import type { Address } from '../../crypto/address/types.js';
import type { Data } from '../../data/data.js';
import type { Hash } from '../../storage/interfaces/hash.js';

export class Identity {
  constructor(
    private readonly data: Data,
    private readonly _address: Address,
    readonly publicEncryptionKey: Uint8Array,
    readonly encryptionKeyAlgorithm: number,
    readonly publicSigningKey: Uint8Array,
    readonly signingKeyAlgorithm: number,
  ) {}

  get address(): Readonly<Address> {
    return this._address;
  }

  push(): Promise<Hash> {
    return this.data.putNamedJSON(
      {
        address: this._address,
        encryption: {
          publicKey: this.publicEncryptionKey,
          type: this.encryptionKeyAlgorithm,
        },
        sign: {
          publicKey: this.publicSigningKey,
          type: this.signingKeyAlgorithm,
        },
      },
      this._address.value,
    );
  }
}
