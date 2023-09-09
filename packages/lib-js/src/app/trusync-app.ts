import { Data } from '../data/data.js';
import { Identity } from '../identity/identity.js';
import { StorageDriver } from '../storage/interfaces/storage-driver.js';

export class TrusyncApp {
  constructor(
    private readonly internalStorageDrivers: StorageDriver[],
    readonly data: Data,
    readonly identity: Identity,
  ) {}

  get storageDrivers(): StorageDriver[] {
    // Expose a shallow clone
    return [...this.internalStorageDrivers];
  }

  pushStorageDriver(driver: StorageDriver): TrusyncApp {
    this.internalStorageDrivers.push(driver);
    return this;
  }
}
