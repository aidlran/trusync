import { configuredKMS } from '../keys';
import { Hash } from '../storage/interfaces/hash';
import { StorageDriver } from '../storage/interfaces/storage-driver';

/**
 * A truSync app instance.
 */
export class TrusyncApp {
  private readonly internalStorageDrivers = new Array<StorageDriver>();
  private readonly keyManagement = configuredKMS();
  private _sessionIsActive = false;
  private _onChange?: () => unknown;

  get storageDrivers(): StorageDriver[] {
    // Expose a shallow clone
    return [...this.internalStorageDrivers];
  }

  get sessionIsActive(): boolean {
    return this._sessionIsActive;
  }

  set onChange(fn: () => unknown) {
    this._onChange = fn;
  }

  private emitChange(): void {
    if (this._onChange) {
      this._onChange();
    }
  }

  pushStorageDriver(driver: StorageDriver): TrusyncApp {
    this.internalStorageDrivers.push(driver);
    return this;
  }

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
        this.internalStorageDrivers.map(async (store) => {
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
  async put(payload: string, mediaType = 'text/plain'): Promise<void> {
    const hash = await this.hash(payload);
    const results = await Promise.allSettled(
      this.internalStorageDrivers.map(async (store) => {
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
  }

  getJSON<T>(hash: Hash): Promise<T> {
    return this.get(hash).then((payload) => JSON.parse(payload) as T);
  }

  /**
   * @throws {PromiseSettledResult<void>[]}
   */
  async putJSON<T>(payload: T): Promise<void> {
    return this.put(JSON.stringify(payload), 'application/json');
  }

  getNamed(name: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      void Promise.allSettled<Promise<void>>(
        this.internalStorageDrivers.map(async (store) => {
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
  async putNamed(payload: string, name: string, mediaType = 'text/plain'): Promise<void> {
    const hash = await this.hash(payload);
    const results = await Promise.allSettled(
      this.internalStorageDrivers.map(async (store) => {
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
  }

  getNamedJSON<T>(name: string): Promise<T> {
    return this.getNamed(name).then((payload) => JSON.parse(payload) as T);
  }

  /**
   * @throws {PromiseSettledResult<void>[]}
   */
  putNamedJSON(payload: unknown, name: string): Promise<void> {
    return this.putNamed(JSON.stringify(payload), name, 'application/json');
  }

  async createIdentity(): Promise<{
    privateKey: string;
    publicKey: string;
  }> {
    const keyPair = await this.keyManagement.keys.generateKeyPair();
    await this.putNamedJSON({ publicKey: keyPair.publicKey }, keyPair.publicKey);
    await this.keyManagement.keys.import({
      keyID: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    });
    this._sessionIsActive = true;
    this.emitChange();
    return keyPair;
  }
}
