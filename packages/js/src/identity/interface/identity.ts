import type { Address, AddressType } from '../../crypto/address/types.js';

export interface Identity {
  address: Address<AddressType>;
  encrypt: {
    publicKey: Uint8Array;
    type: number;
  };
  sign: {
    publicKey: Uint8Array;
    type: number;
  };
}
