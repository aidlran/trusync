import { StorageDriver } from '../storage/interfaces/storage-driver';

/**
 * Constructs a Trusync app, which is configured using the builder pattern.
 */
export class TrusyncApp {
  private readonly internalStorageDrivers = new Array<StorageDriver>();

  get storageDrivers(): StorageDriver[] {
    // Expose a shallow clone
    return [...this.internalStorageDrivers];
  }

  pushStorageDriver(driver: StorageDriver): TrusyncApp {
    this.internalStorageDrivers.push(driver);
    return this;
  }
}
