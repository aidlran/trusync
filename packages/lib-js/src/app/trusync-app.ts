import { Data } from '../data/data.js';
import { Identity } from '../identity/identity.js';
import { StorageDriver } from '../storage/interfaces/storage-driver.js';

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
