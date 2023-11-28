import type { Address } from '../../crypto/address/types.js';

export interface Identity {
  address: Address;
  encrypt: {
    publicKey: Uint8Array;
    type: number;
  };
  sign: {
    publicKey: Uint8Array;
    type: number;
  };
}
