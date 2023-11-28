import type { CommonCryptoInterface } from '../common-interface.js';

export enum HashType {
  SHA256 = 0,
}

export type Hash = CommonCryptoInterface<HashType, Uint8Array>;
