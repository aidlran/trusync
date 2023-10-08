import type { Data } from '../data/data';
import type { Identity } from '../identity/identity';
import type { StorageDriver } from '../storage/interfaces/storage-driver';

export class TrusyncApp {
  constructor(
    private readonly _storageDrivers: StorageDriver[],
    readonly data: Data,
    readonly identity: Identity,
  ) {}

  get storageDrivers(): StorageDriver[] {
    // Expose a shallow clone
    return [...this._storageDrivers];
  }

  pushStorageDriver(driver: StorageDriver): TrusyncApp {
    this._storageDrivers.push(driver);
    return this;
  }
}
