import { getHash, getHashKey } from '../functions/hash-key';
import type { Hash, RawData, StorageDriver } from '../interfaces';

/**
 * Localstorage driver for testing and development.
 * Not suitable for production.
 */
export class LocalStorageDriver implements StorageDriver {
  deleteData(hash: Hash): void {
    localStorage.removeItem(getHashKey(hash));
  }

  getData(hash: Hash): RawData | undefined {
    const data = localStorage.getItem(getHashKey(hash));
    return data ? (JSON.parse(data) as RawData) : undefined;
  }

  putData(rawData: RawData): void {
    localStorage.setItem(getHashKey(rawData.hash), JSON.stringify(rawData));
  }

  unsetNamedDataHash(name: string): void {
    localStorage.removeItem(name);
  }

  getNamedDataHash(name: string): Hash | undefined {
    const hashKey = localStorage.getItem(name);
    return hashKey ? getHash(hashKey) : undefined;
  }

  setNamedDataHash(name: string, hash: Hash): void {
    localStorage.setItem(name, getHashKey(hash));
  }
}

export default LocalStorageDriver;
