import type { Hash, StorageDriver } from '../storage/interfaces';

export class Data {
  constructor(private readonly storageDrivers: StorageDriver[]) {}

  private async hash(payload: string): Promise<Hash> {
    const hashBytes = new Uint8Array(
      await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload)),
    );
    let hashBinary = '';
    for (const index in hashBytes) {
      hashBinary += String.fromCharCode(hashBytes[index]);
    }
    return {
      algorithm: 'sha256',
      value: btoa(hashBinary),
    };
  }

  async get(hash: Hash): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      void Promise.allSettled<Promise<void>>(
        this.storageDrivers.map(async (store) => {
          const data = await store.getData(hash);
          if (!data || data.hash.algorithm !== hash.algorithm || data.hash.value !== hash.value) {
            return;
          }
          const validateHash = await this.hash(data.payload);
          if (
            data.hash.algorithm !== validateHash.algorithm ||
            data.hash.value !== validateHash.value
          ) {
            return;
          }
          resolve(data.payload);
        }),
      ).then((results) => {
        if (!results.find((promise) => promise.status === 'fulfilled' && promise.value)) {
          reject(new Error(`truSync: data not found: '${hash.algorithm}:${hash.value}'`));
        }
      });
    });
  }

  /**
   * @throws {PromiseSettledResult<void>[]}
   */
  async put(payload: string, mediaType = 'text/plain'): Promise<Hash> {
    const hash = await this.hash(payload);
    const results = await Promise.allSettled(
      this.storageDrivers.map(async (store) => {
        await store.putData({
          hash,
          encoding: 'utf8',
          mediaType,
          payload,
        });
      }),
    );

    if (!results.find((promise) => promise.status === 'fulfilled')) {
      throw results;
    }

    return hash;
  }

  getJSON<T>(hash: Hash): Promise<T> {
    return this.get(hash).then((payload) => JSON.parse(payload) as T);
  }

  /**
   * @throws {PromiseSettledResult<void>[]}
   */
  async putJSON<T>(payload: T): Promise<Hash> {
    return this.put(JSON.stringify(payload), 'application/json');
  }

  getNamed(name: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      void Promise.allSettled<Promise<void>>(
        this.storageDrivers.map(async (store) => {
          const hash = await store.getNamedDataHash(name);
          if (!hash) return;
          const data = await store.getData(hash);
          if (!data || data.hash.algorithm !== hash.algorithm || data.hash.value !== hash.value) {
            return;
          }
          const validateHash = await this.hash(data.payload);
          if (
            data.hash.algorithm !== validateHash.algorithm ||
            data.hash.value !== validateHash.value
          ) {
            return;
          }
          resolve(data.payload);
        }),
      ).then((results) => {
        if (!results.find((promise) => promise.status === 'fulfilled' && promise.value)) {
          reject(new Error(`truSync: named data not found: '${name}'`));
        }
      });
    });
  }

  /**
   * @throws {PromiseSettledResult<void>[]}
   */
  async putNamed(payload: string, name: string, mediaType = 'text/plain'): Promise<Hash> {
    const hash = await this.hash(payload);
    const results = await Promise.allSettled(
      this.storageDrivers.map(async (store) => {
        await store.putData({
          hash,
          encoding: 'utf8',
          mediaType,
          payload,
        });
        await store.setNamedDataHash(name, hash);
      }),
    );

    if (!results.find((promise) => promise.status === 'fulfilled')) {
      throw results;
    }

    return hash;
  }

  getNamedJSON<T>(name: string): Promise<T> {
    return this.getNamed(name).then((payload) => JSON.parse(payload) as T);
  }

  /**
   * @throws {PromiseSettledResult<void>[]}
   */
  putNamedJSON(payload: unknown, name: string): Promise<Hash> {
    return this.putNamed(JSON.stringify(payload), name, 'application/json');
  }
}
