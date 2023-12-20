import type { CommonCryptoInterface } from '../common-interface.js';

export enum AddressType {
  DERIVED_SHA_B58 = 0x00,
}

export type Address<T extends AddressType> = CommonCryptoInterface<T, string>;
