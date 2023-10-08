import { TrusyncApp } from './app/trusync-app.js';
import { Data } from './data/data.js';
import { Identity } from './identity/identity.js';
import { KeyManager } from './keys/primary/classes/key-manager.js';
import { StorageDriver } from './storage/interfaces/storage-driver.js';

export * from './storage';
export type { Data, Identity, TrusyncApp };

export function trusyncApp() {
  const storageDrivers = new Array<StorageDriver>();
  const data = new Data(storageDrivers);
  const keyManager = new KeyManager();
  const identity = new Identity(data, keyManager);
  const app = new TrusyncApp(storageDrivers, data, identity);
  return app;
}
