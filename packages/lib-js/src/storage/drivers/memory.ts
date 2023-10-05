import { type HashKey, getHashKey, getHash } from '../functions/hash-key.js';
import type { Hash } from '../interfaces/hash.js';
import type { RawData } from '../interfaces/raw-data.js';
import type { StorageDriver } from '../interfaces/storage-driver.js';

export class MemoryDriver implements StorageDriver {
  private readonly data = new Map<HashKey, RawData>();
  private readonly namedData = new Map<string, HashKey>();

  deleteData(hash: Hash): void {
    this.data.delete(getHashKey(hash));
  }

  getData(hash: Hash): RawData | undefined {
    const data = this.data.get(getHashKey(hash));
    return data ? structuredClone(data) : undefined;
  }

  putData(rawData: RawData): void {
    this.data.set(getHashKey(rawData.hash), structuredClone(rawData));
  }

  unsetNamedDataHash(name: string): void {
    this.namedData.delete(name);
  }

  getNamedDataHash(name: string): Hash | undefined {
    const hashKey = this.namedData.get(name);
    return hashKey ? getHash(hashKey) : undefined;
  }

  setNamedDataHash(name: string, hash: Hash): void {
    this.namedData.set(name, getHashKey(hash));
  }
}

export default MemoryDriver;
