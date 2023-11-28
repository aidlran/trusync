import type { CommonCryptoInterface } from '../common-interface.js';

export enum AddressType {
  DERIVED_SHA_B58 = 0,
}

export type Address = CommonCryptoInterface<AddressType, string>;
