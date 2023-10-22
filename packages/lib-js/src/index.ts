import { TrusyncApp } from './app/trusync-app';
import { Data } from './data/data';
import { Identity } from './identity/identity';
import { KeyManager } from './keys/primary/classes/key-manager';
import type { StorageDriver } from './storage/interfaces/storage-driver';

export * from './crypto';
export type { GenerateIdentityResult, GetSessionsResult } from './keys/shared';
export * from './storage';
export type { Data, Identity, TrusyncApp };

function createWorker() {
  return new Worker(new URL('./keys/worker/worker.js?worker', import.meta.url), {
    type: 'module',
  });
}

export function trusyncApp() {
  const storageDrivers = new Array<StorageDriver>();
  const data = new Data(storageDrivers);
  const keyManager = new KeyManager(createWorker);
  const identity = new Identity(data, keyManager);
  const app = new TrusyncApp(storageDrivers, data, identity);
  return app;
}
