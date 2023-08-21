import type { StorageDriver } from '../../storage/interfaces/storage-driver.js';

export interface TrusyncConfig {
  storage: StorageDriver | StorageDriver[];
}
