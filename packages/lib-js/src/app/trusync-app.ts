import { configuredKMS } from '../keys';
import { Hash } from '../storage/interfaces/hash';
import { StorageDriver } from '../storage/interfaces/storage-driver';

/**
 * Constructs a Trusync app, which is configured using the builder pattern.
 */
export class TrusyncApp {
  private readonly internalStorageDrivers = new Array<StorageDriver>();
  private readonly keyManagement = configuredKMS();
  private _sessionIsActive = false;
  private _onIdentityChange?: () => unknown;

  get storageDrivers(): StorageDriver[] {
    // Expose a shallow clone
    return [...this.internalStorageDrivers];
  }

  get sessionIsActive(): boolean {
    return this._sessionIsActive;
  }

  set onIdentityChange(fn: () => unknown) {
    this._onIdentityChange = fn;
  }

  private emitIdentityChange(): void {
    if (this._onIdentityChange) {
      this._onIdentityChange();
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

  private async put(payload: string, mediaType = 'text/plain'): Promise<boolean> {
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
    return !!results.find((result) => result.status === 'fulfilled');
  }

  private async putJSON(payload: object): Promise<boolean> {
    return this.put(JSON.stringify(payload), 'application/json');
  }

  private async putNamed(
    payload: string,
    name: string,
    mediaType = 'text/plain',
  ): Promise<boolean> {
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
    return !!results.find((result) => result.status === 'fulfilled');
  }

  private async putNamedJSON(payload: object, name: string): Promise<boolean> {
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
    this.emitIdentityChange();
    return keyPair;
  }
}
