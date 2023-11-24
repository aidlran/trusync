import { base58 } from '../encode/base.js';
import { sha256 } from '../hash/sha256.js';
import { AddressType, type Address } from './types.js';

export function derivedShaB58(
  source: Uint8Array,
  callback?: (address: Address) => never,
): Promise<Address> {
  return sha256(source).then((hash) => {
    const address: Address = {
      type: AddressType.DERIVED_SHA_B58,
      value: base58.encode(hash),
    };
    if (callback) {
      callback(address);
    }
    return address;
  });
}
