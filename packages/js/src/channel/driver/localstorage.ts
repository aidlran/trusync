import { getHash, getHashKey } from '../../storage/functions/hash-key.js';
import type { Hash } from '../../storage/interfaces/hash.js';
import type { RawData } from '../../storage/interfaces/raw-data.js';
import type { Channel } from '../channel.js';

export class LocalStorageChannel implements Channel {
  deleteNode(hash: Hash): void {
    localStorage.removeItem(getHashKey(hash));
  }

  getNode(hash: Hash): RawData | undefined {
    const data = localStorage.getItem(getHashKey(hash));
    return data ? (JSON.parse(data) as RawData) : undefined;
  }

  putNode(rawData: RawData): void {
    localStorage.setItem(getHashKey(rawData.hash), JSON.stringify(rawData));
  }

  unsetAddressedNode(name: string): void {
    localStorage.removeItem(name);
  }

  getAddressedNodeHash(name: string): Hash | undefined {
    const hashKey = localStorage.getItem(name);
    return hashKey ? getHash(hashKey) : undefined;
  }

  setAddressedNodeHash(name: string, hash: Hash): void {
    localStorage.setItem(name, getHashKey(hash));
  }
}

export default LocalStorageChannel;
