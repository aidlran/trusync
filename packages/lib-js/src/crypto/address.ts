import { concatenateByteArray } from './common/buffer-utils';
import { base58 } from './encode/base';
import { sha256 } from './hash/sha256';

export interface Address {
  type: AddressType;
  value: string;
}

export enum AddressType {
  DERIVED_SHA_B58 = 0,
}

export async function generateAddress(
  publicEncryptionKey: Uint8Array,
  publicSigningKey: Uint8Array,
): Promise<Address> {
  const addressByteArray = concatenateByteArray(publicEncryptionKey, publicSigningKey);
  const addressHash = await sha256(addressByteArray);
  const addressEncoded = base58.encode(addressHash);
  return {
    type: AddressType.DERIVED_SHA_B58,
    value: addressEncoded,
  };
}
