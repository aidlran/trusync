import type { Hash } from '../../interfaces/hash.js';
import type { RawData } from '../../interfaces/raw-data.js';
import type { StorageDriver } from '../../interfaces/storage-driver.js';

type HashKey = string;

export class MemoryDriver implements StorageDriver {
  private readonly data = new Map<HashKey, RawData>();
  private readonly namedData = new Map<string, HashKey>();

  private getHashKey(hash: Hash): HashKey {
    return `${hash.algorithm}:${hash.value}`;
  }

  private getHash(hashKey: HashKey): Hash {
    const [algorithm, value] = hashKey.split(':');
    return { algorithm, value };
  }

  deleteData(hash: Hash): void {
    this.data.delete(this.getHashKey(hash));
  }

  getData(hash: Hash): RawData | undefined {
    const data = this.data.get(this.getHashKey(hash));
    return data ? structuredClone(data) : undefined;
  }

  putData(rawData: RawData): void {
    this.data.set(this.getHashKey(rawData.hash), structuredClone(rawData));
  }

  unsetNamedDataHash(name: string): void {
    this.namedData.delete(name);
  }

  getNamedDataHash(name: string): Hash | undefined {
    const hashKey = this.namedData.get(name);
    return hashKey ? this.getHash(hashKey) : undefined;
  }

  setNamedDataHash(name: string, hash: Hash): void {
    this.namedData.set(name, this.getHashKey(hash));
  }
}
