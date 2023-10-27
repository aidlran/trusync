import { type HashKey, getHashKey, getHash } from '../../../storage/functions/hash-key.js';
import type { Hash } from '../../../storage/interfaces/hash.js';
import type { RawData } from '../../../storage/interfaces/raw-data.js';
import type { Channel } from '../channel.js';

export class MemoryChannel implements Channel {
  private readonly data = new Map<HashKey, RawData>();
  private readonly namedData = new Map<string, HashKey>();

  deleteNode(hash: Hash): void {
    this.data.delete(getHashKey(hash));
  }

  getNode(hash: Hash): RawData | undefined {
    const data = this.data.get(getHashKey(hash));
    return data ? structuredClone(data) : undefined;
  }

  putNode(rawData: RawData): void {
    this.data.set(getHashKey(rawData.hash), structuredClone(rawData));
  }

  unsetAddressedNode(name: string): void {
    this.namedData.delete(name);
  }

  getAddressedNodeHash(name: string): Hash | undefined {
    const hashKey = this.namedData.get(name);
    return hashKey ? getHash(hashKey) : undefined;
  }

  setAddressedNodeHash(name: string, hash: Hash): void {
    this.namedData.set(name, getHashKey(hash));
  }
}

export default MemoryChannel;
