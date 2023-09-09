import { TrusyncApp } from './app/trusync-app.js';
import { Data } from './data/data.js';
import { Identity } from './identity/identity.js';
import { configuredKMS } from './keys/configured-kms.js';
import { StorageDriver } from './storage/interfaces/storage-driver.js';

export * from './storage';
export type { Data, Identity, TrusyncApp };

export function trusyncApp() {
  const storageDrivers = new Array<StorageDriver>();
  const data = new Data(storageDrivers);
  const keyManagement = configuredKMS();
  const identity = new Identity(data, keyManagement);
  const app = new TrusyncApp(storageDrivers, data, identity);
  return app;
}
